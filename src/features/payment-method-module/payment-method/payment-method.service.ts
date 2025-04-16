import { PrismaService } from "@features/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
        ...createPaymentMethodDto,
        createdAt: new Date(), 
        deletedAt: null,
      },
    });
  }

  async findAll() {
    return await this.prisma.paymentMethod.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: {
        name: updatePaymentMethodDto.name
      },
    });
  
    if (existing) {
      throw new BadRequestException(`Ya existe un método de pago con el nombre "${updatePaymentMethodDto.name}"`);
    }
    return await this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.paymentMethod.findUnique({ where: { id } });
  
    if (!existing) {
      throw new NotFoundException(`Método de pago con id ${id} no encontrado`);
    }
  
    if (existing.deletedAt) {
      throw new BadRequestException(`El método de pago con id ${id} ya fue eliminado`);
    }
  
    return await this.prisma.paymentMethod.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
