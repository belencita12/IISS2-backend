import {
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
} from '@nestjs/common';

export const ImgValidator = new ParseFilePipe({
	fileIsRequired: false,
	validators: [
		new MaxFileSizeValidator({
			maxSize: 1024 * 1024,
			message: 'El archivo no debe exceder 1MB',
		}),
		new FileTypeValidator({
			fileType: /^image\/(webp|png|jpeg)$/,
		}),
	],
});
