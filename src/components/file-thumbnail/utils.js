import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Define more types here
const FORMAT_PDF = ['pdf'];
const FORMAT_TEXT = ['txt'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_ZIP = ['zip', 'rar', 'iso'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_AUDIO = ['wav', 'aif', 'mp3', 'aac'];
const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'svg', 'webp'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];

const iconUrl = (icon) => `${CONFIG.site.basePath}/assets/icons/files/${icon}.svg`;

// ----------------------------------------------------------------------

export function fileFormat(fileUrl) {
  const fileByUrl = fileTypeByUrl(fileUrl);

  if (FORMAT_TEXT.includes(fileByUrl)) return 'txt';
  if (FORMAT_ZIP.includes(fileByUrl)) return 'zip';
  if (FORMAT_AUDIO.includes(fileByUrl)) return 'audio';
  if (FORMAT_IMG.includes(fileByUrl)) return 'image';
  if (FORMAT_VIDEO.includes(fileByUrl)) return 'video';
  if (FORMAT_WORD.includes(fileByUrl)) return 'word';
  if (FORMAT_EXCEL.includes(fileByUrl)) return 'excel';
  if (FORMAT_POWERPOINT.includes(fileByUrl)) return 'powerpoint';
  if (FORMAT_PDF.includes(fileByUrl)) return 'pdf';
  if (FORMAT_PHOTOSHOP.includes(fileByUrl)) return 'photoshop';
  if (FORMAT_ILLUSTRATOR.includes(fileByUrl)) return 'illustrator';

  return fileByUrl;
}

// ----------------------------------------------------------------------

export function fileThumb(fileUrl) {
  let thumb;

  switch (fileFormat(fileUrl)) {
    case 'folder':
      thumb = iconUrl('ic-folder');
      break;
    case 'txt':
      thumb = iconUrl('ic-txt');
      break;
    case 'zip':
      thumb = iconUrl('ic-zip');
      break;
    case 'audio':
      thumb = iconUrl('ic-audio');
      break;
    case 'video':
      thumb = iconUrl('ic-video');
      break;
    case 'word':
      thumb = iconUrl('ic-word');
      break;
    case 'excel':
      thumb = iconUrl('ic-excel');
      break;
    case 'powerpoint':
      thumb = iconUrl('ic-power_point');
      break;
    case 'pdf':
      thumb = iconUrl('ic-pdf');
      break;
    case 'photoshop':
      thumb = iconUrl('ic-pts');
      break;
    case 'illustrator':
      thumb = iconUrl('ic-ai');
      break;
    case 'image':
      thumb = iconUrl('ic-img');
      break;
    default:
      thumb = iconUrl('ic-file');
  }
  return thumb;
}

// ----------------------------------------------------------------------

export function fileTypeByUrl(fileUrl) {
  if (!fileUrl) return '';

  const cleanUrl = String(fileUrl).split('?')[0].split('#')[0];
  const extension = cleanUrl.split('.').pop()?.toLowerCase() || '';

  if (FORMAT_IMG.includes(extension)) {
    return extension;
  }

  if (/unsplash\.com|freepik\.com|picsum\.photos|\/assets\//i.test(fileUrl)) {
    return 'jpg';
  }

  return extension;
}

// ----------------------------------------------------------------------

export function fileNameByUrl(fileUrl) {
  return fileUrl.split('/').pop();
}

// ----------------------------------------------------------------------

export function fileData(file) {
  // From url
  if (typeof file === 'string') {
    return {
      preview: file,
      name: fileNameByUrl(file),
      type: fileTypeByUrl(file),
      size: undefined,
      path: file,
      lastModified: undefined,
      lastModifiedDate: undefined,
    };
  }

  // From file
  return {
    name: file.name,
    size: file.size,
    path: file.path,
    type: file.type,
    preview: file.preview,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
  };
}
