import { ImageRequest } from '../requestmodel/ImageRequest';

export class ImageResponse {
    public url: any;
    public width: number = 0;
    public height: number = 0;
    public size: number = 0;
    public imageObj: ImageRequest;
}
