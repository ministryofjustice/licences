declare namespace Express {
  export interface Request {
    id: string
    user?: {
      username: string
      token: string
      role: string
    }
    session: any
    logout: (done: (err: unknown) => void) => void
    csrfToken: () => string
    flash(): { [key: string]: any[] }
    flash(type: string, message: any): number
    flash(message: string): any[]
  }
  export interface Response {
    locals: {
      user?: {
        username: string
        token: string
        firstName: string
        lastName: string
        userId: string
      }
    }
    renderPDF: (
      view: string,
      pageData: Record<string, any>,
      options: { filename: string; pdfOptions: PdfOptions }
    ) => void
  }
}
