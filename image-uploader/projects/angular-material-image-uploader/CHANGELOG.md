# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-09-09

### Changed
- README: screenshots, badges, and a clearer setup walkthrough on the npm page. No code changes.

## [2.0.0] - 2026-09-09

Complete rewrite for Angular 22. This is a breaking release; see "Upgrading from v1" in the README.

### Added
- Multiple upload with a configurable `maxFiles` limit, plus single mode (`multiple: false`) that replaces the current image.
- Batch cropper: "2 of 5" progress, thumbnail strip, Crop & next, Use original, Remove, Cancel.
- Free-form cropping and aspect ratio presets (1:1, 4:3, 3:2, 16:9, 9:16), round crop.
- Rotate, flip, zoom, reset controls in the cropper; keyboard nudging of the crop area.
- Output format (PNG / JPEG / WebP), quality, and optional downscale (`resizeToWidth`) with a live preview and size estimate.
- Clipboard paste (Ctrl/Cmd+V), drag-over highlight on the drop zone.
- Validation for type, size, file count, and duplicates with toast feedback.
- Item list with thumbnails, dimensions, size, format, and a cropped/original badge.
- Preview lightbox with previous/next, re-crop, and download.
- Drag-and-drop reordering, remove with confirmation, clear all.
- Uploads with per-item progress, cancel, retry, Upload all, and `autoUpload`; real multipart upload when `uploadUrl` is set, simulated otherwise.
- `config` input (`Partial<UploaderConfig>`) that controls every setting from the parent.
- `showSettingsButton` input to show or hide the in-page settings panel.
- `uploadComplete` output.
- `provideAngularMaterialImageUploader()` helper that registers animations, HttpClient, and ngx-toastr.
- Exported types: `UploaderConfig`, `DEFAULT_UPLOADER_CONFIG`, `UploadItem`, `CropResult`, `ASPECT_RATIOS`, `OUTPUT_FORMATS`.

### Changed
- **Breaking:** requires Angular 22, Angular Material and CDK 22, ngx-image-cropper 9, ngx-toastr 20+.
- **Breaking:** components are standalone. Import `ImageUploaderComponent` instead of `AngularMaterialUploaderModule`.
- **Breaking:** `imageDetails` now emits `UploadItem[]` instead of `{ Url, DisplayName }[]`.
- Change detection is zoneless-ready; component state uses signals.
- Cropped output is a real binary `File` (v1 wrapped the base64 string as text).
- Thumbnails show the whole image (contain) on a checkered background instead of a centre crop.

### Deprecated
- `allowImageType`, `sizeLimit`, and `Iscrop` inputs still work but map to `config.allowedTypes`, `config.maxFileSizeMB`, and `config.cropBeforeAdd`.

### Removed
- `@angular/flex-layout` peer dependency.
- `AngularMaterialUploaderModule` and the `MaterialModule` re-export.

### Fixed
- Crop area could not be resized freely: the box was locked to 4:3 and already filled the image height.

## [1.0.9] - 2022-04-11

Last release of the Angular 9 line.

[2.0.1]: https://github.com/00Arun/AngularImageUploader/releases/tag/v2.0.1
[2.0.0]: https://github.com/00Arun/AngularImageUploader/releases/tag/v2.0.0
[1.0.9]: https://www.npmjs.com/package/angular-material-image-uploader/v/1.0.9
