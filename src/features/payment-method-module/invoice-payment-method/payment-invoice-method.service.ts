import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateInvoicePaymentMethodDto } from './dto/create-invoce-payment-method';
import { UpdateInvoicePaymentMethodDto } from './dto/update-invoice-payment-method';
import { InvoicePaymentMethodDto } from './dto/invoice-payment-method.dto';
import { InvoicePaymentMethodQueryDto } from './dto/invoice-payment-method.query.dto';

@Injectable()
export class InvoicePaymentMethodService {
    constructor(private readonly prisma: PrismaService) { }
    async create(data: CreateInvoicePaymentMethodDto): Promise<InvoicePaymentMethodDto> {
        const [methodExists, invoiceExists] = await Promise.all([
            this.prisma.paymentMethod.findFirst({ where: { id: data.methodId, deletedAt: null } }),
            this.prisma.invoice.findUnique({ where: { id: data.invoiceId } }),
        ]);
    
        if (!methodExists) {
            throw new NotFoundException('El método de pago no existe o fue eliminado');
        }
    
        if (!invoiceExists) {
            throw new NotFoundException('La factura no existe');
        }
    
        const created = await this.prisma.invoicePaymentMethod.create({
            data,
            include: {
                method: true,
            },
        });
        return new InvoicePaymentMethodDto(created);
    }
    

    async find(dto: InvoicePaymentMethodQueryDto) {
        const { baseWhere } = this.prisma.getBaseWhere(dto);

        const where = {
            ...baseWhere,
            ...(dto.invoiceId && { invoiceId: dto.invoiceId }),
            ...(dto.methodId && { methodId: dto.methodId }),
            ...(dto.amountMin !== undefined || dto.amountMax !== undefined
                ? {
                    amount: {
                        ...(dto.amountMin !== undefined ? { gte: dto.amountMin } : {}),
                        ...(dto.amountMax !== undefined ? { lte: dto.amountMax } : {}),
                    },
                }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.invoicePaymentMethod.findMany({
                where,
                ...this.prisma.paginate(dto),
                include: {
                    method: true,
                },
            }),
            this.prisma.invoicePaymentMethod.count({ where }),
        ]);

        return this.prisma.getPagOutput({
            data: data.map((item) => new InvoicePaymentMethodDto(item)),
            page: dto.page,
            size: dto.size,
            total,
        });
    }


    async findOne(id: number) {
        const data = await this.prisma.invoicePaymentMethod.findUnique({
            where: {
                id
            },
            include: {
                method: true,
            },
        });

        if (!data) {
            throw new NotFoundException(`No se encontró la relación`);
        }

        return new InvoicePaymentMethodDto(data);
    }

    async update(id: number, data: UpdateInvoicePaymentMethodDto) {
        const record = await this.prisma.invoicePaymentMethod.findUnique({ where: { id } });

        if (!record) {
            throw new NotFoundException(`La relación no existe o fue eliminada`);
        }

        if (data.invoiceId) {
            const invoice = await this.prisma.invoice.findUnique({ where: { id: data.invoiceId } });
            if (!invoice) {
                throw new NotFoundException(`La factura no existe o fue eliminada`);
            }
        }

        if (data.methodId) {
            const method = await this.prisma.paymentMethod.findUnique({ where: { id: data.methodId } });
            if (!method || method.deletedAt) {
                throw new NotFoundException(`El método de pago no existe o fue eliminado`);
            }
        }

        const dataMod = await this.prisma.invoicePaymentMethod.update({
            where: { id },
            data,
            include: {
                method: true,
            },
        });
        return new InvoicePaymentMethodDto(dataMod)
    }

    async remove(id: number) {
        const record = await this.prisma.invoicePaymentMethod.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundException(`La relación no existe o ya fue eliminada`);
        }
        return await this.prisma.invoicePaymentMethod.softDelete({ id });
    }
}
