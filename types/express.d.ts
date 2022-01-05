declare namespace Express {
  export interface Request {
    user?: {
      username: string
      token: string
      refreshToken: string
      refreshTime: any
      role: string
    }
    session: any
    logout: () => void
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
        refreshToken: string
        refreshTime: number
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
