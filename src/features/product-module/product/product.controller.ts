import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { RolesGuard } from '@lib/guard/role.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { ImgValidator } from '@lib/pipes/file-validator.pipe';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';

@AppController({ name: 'product', tag: 'Product' })
@UseGuards(RolesGuard)
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@Roles(Role.Admin)
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: ProductDto })
	@ApiBody({ type: CreateProductDto })
	create(
		@Body() createProductDto: CreateProductDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.productService.create({ ...createProductDto, productImg: img });
	}

	@Get()
	@Roles(Role.Admin, Role.Employee, Role.User)
	@ApiPaginatedResponse(ProductDto)
	findAll(@Query() query: ProductQueryDto) {
		return this.productService.findAll(query);
	}

	@Get(':id')
	@Roles(Role.Admin, Role.Employee, Role.User)
	@ApiResponse({ type: ProductDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.productService.findOne(id);
	}

	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiBody({ type: CreateProductDto })
	@ApiResponse({ type: ProductDto })
	@Roles(Role.Admin)
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: CreateProductDto,
		@UploadedFile(ImgValidator) img?: Express.Multer.File,
	) {
		return this.productService.update(id, {
			...dto,
			productImg: img,
		});
	}

	@Delete(':id')
	@Roles(Role.Admin)
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.productService.remove(id);
	}
}
