export class Place {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public imageUrl: string,
    public price: number,
    public availableFrom: any,
    public availableTo: any,
    public userId:string
  ) {}
}
