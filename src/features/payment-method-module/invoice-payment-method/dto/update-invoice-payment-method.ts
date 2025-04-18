import { PartialType } from '@nestjs/mapped-types';
import {CreateInvoicePaymentMethodDto} from './create-invoce-payment-method'

export class UpdateInvoicePaymentMethodDto extends PartialType(CreateInvoicePaymentMethodDto) {}