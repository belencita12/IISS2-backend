export interface IMapper<E, D> {
	toDto(entity: E): D;
	toEntity?(dto: D): E;
}
