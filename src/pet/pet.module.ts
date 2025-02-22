import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { MascotaService } from './mascota/mascota.service';

@Module({
  controllers: [PetController],
  providers: [PetService, MascotaService],
})
export class PetModule {}
