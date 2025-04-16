import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateInvoicePaymentMethodDto } from './dto/create-invoce-payment-method';
import { UpdateInvoicePaymentMethodDto } from './dto/update-invoice-payment-method';

@Injectable()
export class InvoicePaymentMethodService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateInvoicePaymentMethodDto) {
        const { invoiceId, methodId, amount } = data;
        const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) {
            throw new NotFoundException(`La factura con ID ${invoiceId} no existe`);
        }

        const method = await this.prisma.paymentMethod.findUnique({ where: { id: methodId } });
        if (!method || method.deletedAt) {
            throw new NotFoundException(`El método de pago con ID ${methodId} no existe o fue eliminado`);
        }

        const existing = await this.prisma.invoicePaymentMethod.findFirst({
            where: {
                invoiceId,
                methodId,
                deletedAt: null,
            },
        });

        if (existing) {
            throw new BadRequestException(`Ya existe una relación activa entre esta factura y este método de pago`);
        }

        return await this.prisma.invoicePaymentMethod.create({
            data: {
                invoiceId,
                methodId,
                amount,
                createdAt: new Date(),
            },
            include: {
                method: true,
                invoice: true,
            },
        });
    }

    async find(invoiceId?: number) {
        return await this.prisma.invoicePaymentMethod.findMany({
            where: {
                invoiceId,
                deletedAt: null,
            },
            include: {
                method: true,
                invoice: true,
            },
        });
    }

    async findOne(id: number) {
        const result = await this.prisma.invoicePaymentMethod.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                method: true,
                invoice: true,
            },
        });

        if (!result) {
            throw new NotFoundException(`No se encontró una relación activa con ID ${id}`);
        }

        return result;
    }

    async update(id: number, data: UpdateInvoicePaymentMethodDto) {
        const record = await this.prisma.invoicePaymentMethod.findUnique({ where: { id } });

        if (!record || record.deletedAt) {
            throw new NotFoundException(`La relación con ID ${id} no existe o fue eliminada`);
        }

        if (data.invoiceId) {
            const invoice = await this.prisma.invoice.findUnique({ where: { id: data.invoiceId } });
            if (!invoice) {
                throw new NotFoundException(`La factura con ID ${data.invoiceId} no existe o fue eliminada`);
            }
        }

        if (data.methodId) {
            const method = await this.prisma.paymentMethod.findUnique({ where: { id: data.methodId } });
            if (!method || method.deletedAt) {
                throw new NotFoundException(`El método de pago con ID ${data.methodId} no existe o fue eliminado`);
            }
        }

        return await this.prisma.invoicePaymentMethod.update({
            where: { id },
            data,
            include: {
                method: true,
                invoice: true,
            },
        });
    }

    async remove(id: number) {
        const record = await this.prisma.invoicePaymentMethod.findUnique({ where: { id } });

        if (!record || record.deletedAt) {
            throw new NotFoundException(`La relación con ID ${id} no existe o ya fue eliminada`);
        }

        return await this.prisma.invoicePaymentMethod.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}
