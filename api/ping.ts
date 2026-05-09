export default function handler(req: { method?: string; url?: string }, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  res.status(200).json({
    ok: true,
    method: req.method ?? null,
    url: req.url ?? null,
  });
}

