import { DomainError } from '@/utils/error';
import { ResponseBuilder } from '@/utils/responseBuilder';
import { parseOrThrow } from '@/utils/validation';
import {
  createDocument,
  createDocumentFromText,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from '@/services/documentService';
import {
  ALLOWED_IMPORT_EXTENSIONS,
  ALLOWED_IMPORT_MIME_TYPES,
  MAX_IMPORT_BYTES,
  createDocumentSchema,
  documentIdParamSchema,
  updateDocumentSchema,
} from '@ajaia/schema';
import { Router, type Request, type Response } from 'express';
import { requireAuth } from '@/middleware/auth';
import multer from 'multer';
import path from 'path';

const documentsRouter: Router = Router();

documentsRouter.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMPORT_BYTES, files: 1 },
});

function currentUserId(req: Request): string {
  if (!req.user) {
    throw DomainError.unauthorized('Please login', 'UNAUTHORIZED');
  }
  return req.user.id;
}

documentsRouter.get('/', async (req: Request, res: Response) => {
  const docs = await listDocuments(currentUserId(req));
  ResponseBuilder.success(res, 200, docs);
});

documentsRouter.post('/', async (req: Request, res: Response) => {
  const input = parseOrThrow(createDocumentSchema, req.body);
  const doc = await createDocument(currentUserId(req), input);
  ResponseBuilder.success(res, 201, doc);
});

documentsRouter.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw DomainError.badRequest('No file uploaded', 'NO_FILE');
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!(ALLOWED_IMPORT_EXTENSIONS as readonly string[]).includes(ext)) {
    throw DomainError.badRequest('Only .txt and .md files are supported', 'UNSUPPORTED_FILE_TYPE');
  }
  const mimeOk =
    (ALLOWED_IMPORT_MIME_TYPES as readonly string[]).includes(file.mimetype) ||
    file.mimetype.startsWith('text/') ||
    file.mimetype === 'application/octet-stream';
  if (!mimeOk) {
    throw DomainError.badRequest('Unsupported file MIME type', 'UNSUPPORTED_FILE_TYPE');
  }
  if (file.size === 0) {
    throw DomainError.badRequest('File is empty', 'EMPTY_FILE');
  }
  const text = file.buffer.toString('utf8');
  if (text.trim().length === 0) {
    throw DomainError.badRequest('File is empty', 'EMPTY_FILE');
  }
  let title = path.basename(file.originalname, path.extname(file.originalname)).trim();
  if (title.length === 0) {
    title = 'Untitled document';
  }
  title = title.slice(0, 150);
  const doc = await createDocumentFromText(currentUserId(req), title, text);
  ResponseBuilder.success(res, 201, doc);
});

documentsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  const doc = await getDocument(currentUserId(req), id);
  ResponseBuilder.success(res, 200, doc);
});

documentsRouter.patch('/:id', async (req: Request, res: Response) => {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  const input = parseOrThrow(updateDocumentSchema, req.body);
  const doc = await updateDocument(currentUserId(req), id, input);
  ResponseBuilder.success(res, 200, doc);
});

documentsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  await deleteDocument(currentUserId(req), id);
  ResponseBuilder.success(res, 200, { ok: true });
});

export { documentsRouter };