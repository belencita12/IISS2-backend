import {
	Controller,
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
import { Role } from '@/lib/constants/role.enum';
import { Roles } from '@/lib/decorators/roles.decorators';
import { RolesGuard } from '@/lib/guard/role.guard';
import {
	ApiTags,
	ApiBearerAuth,
	ApiBody,
	ApiResponse,
	ApiConsumes,
} from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidator } from '@/lib/pipes/file-validator.pipe';
import { IdValidationPipe } from '@/lib/pipes/id-validation.pipe';

@Controller('product')
@ApiTags('Product')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiResponse({ type: ProductDto })
	@ApiBody({ type: CreateProductDto })
	create(
		@Body() createProductDto: CreateProductDto,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		return this.productService.create({ ...createProductDto, productImg: img });
	}

	@Get()
	@ApiPaginatedResponse(ProductDto)
	findAll(@Query() query: ProductQueryDto) {
		return this.productService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: ProductDto })
	findOne(@Param('id', IdValidationPipe) id: number) {
		return this.productService.findOne(id);
	}

	@Patch(':id')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('productImg'))
	@ApiBody({ type: CreateProductDto })
	@ApiResponse({ type: ProductDto })
	update(
		@Param('id', IdValidationPipe) id: number,
		@Body() dto: CreateProductDto,
		@UploadedFile(FileValidator) img?: Express.Multer.File,
	) {
		return this.productService.update(id, {
			...dto,
			productImg: img,
		});
	}

	@Delete(':id')
	remove(@Param('id', IdValidationPipe) id: number) {
		return this.productService.remove(id);
	}
}
