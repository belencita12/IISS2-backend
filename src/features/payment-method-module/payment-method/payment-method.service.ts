import { PrismaService } from "@features/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethodQueryDto } from "./dto/payment-method.query.dto";
import { Prisma } from "@prisma/client";
import { PaymentMethodDto } from "./dto/payment-method.dto";

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: {
        name: createPaymentMethodDto.name
      },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un método de pago con el nombre "${createPaymentMethodDto.name}"`);
    }

    return await this.prisma.paymentMethod.create({
      data: {
        ...createPaymentMethodDto
      },
    });
  }

  async findAll(dto: PaymentMethodQueryDto) {
    const { baseWhere } = this.prisma.getBaseWhere(dto);

    const where: Prisma.PaymentMethodWhereInput = {
      ...baseWhere,
      name: dto.name ? { contains: dto.name, mode: 'insensitive' } : undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentMethod.findMany({
        ...this.prisma.paginate(dto),
        where,
      }),
      this.prisma.paymentMethod.count({ where }),
    ]);

    return this.prisma.getPagOutput({
      page: dto.page,
      size: dto.size,
      total,
      data: data.map((item) => new PaymentMethodDto(item)),
    });
  }


  async findOne(id: number) {
    const data = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (data) {
      return new PaymentMethodDto(data);
    }
    else {
      throw new NotFoundException(`Método de pago no encontrado`);
    }
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const existing = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Método de pago no encontrado`);
    }

    const duplicated = await this.prisma.paymentMethod.findUnique({ where: { name: updatePaymentMethodDto.name } });
    if (duplicated && duplicated.id !== id) {
      throw new BadRequestException(`Ya existe un método de pago con el nombre "${updatePaymentMethodDto.name}"`);
    }


    const updated = await this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
    });
    return new PaymentMethodDto(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Método de pago no encontrado`);
    }
    return await this.prisma.paymentMethod.softDelete({ id });
  }
}
