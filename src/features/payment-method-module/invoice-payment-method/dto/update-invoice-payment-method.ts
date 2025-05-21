import { PartialType } from '@nestjs/swagger';
import {CreateInvoicePaymentMethodDto} from './create-invoce-payment-method'

export class UpdateInvoicePaymentMethodDto extends PartialType(CreateInvoicePaymentMethodDto) {}