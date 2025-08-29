export enum MimeType {
  PDF = "application/pdf",
  PNG = "image/png",
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  MP4 = "video/mp4",
  JSON = "application/json",
  TEXT = "text/plain",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

export const supportedMimeTypes = [
  MimeType.PDF.valueOf(),
  MimeType.PNG.valueOf(),
  MimeType.JPEG.valueOf(),
  MimeType.JPG.valueOf(),
  MimeType.MP4.valueOf(),
  MimeType.JSON.valueOf(),
  MimeType.TEXT.valueOf()
]