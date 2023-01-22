import { Injectable } from '@angular/core';

export enum RadiusSize {
    None = 0,
    Default = 3,
    Medium = 9,
    Large = 15,
}

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferenceService {
    pictureDimensions = { width: 640, height: 480 };

    constructor() {}

    detectDifferences(picture1: ImageBitmap, picture2: ImageBitmap, radius: RadiusSize) {
        // Younes
        // thibault
    }

    computeLevelDifficulty(nDifferences: number, blackAndWhiteMapPath) {
        if(nDifferences < 7) { return "facile "}

        // let canvas : HTMLCanvasElement = document.createElement("canvas");
        // let context = canvas.getContext('2d');
        // context?.drawImage(blackAndWhiteMapPath, 0, 0);
        // let data = context?.getImageData(0, 0, this.pictureDimensions.height, this.pictureDimensions.width);
        // let pixels : Array<Array<String>> = new Array();

        // let whiteCounter = 0;
        // for pixel in pixels {
        //     if (pixel is white) {
        //         blackCounter++;
        //     }
        // }
        
        // const surfaceCovered : number = whiteCounter/ (this.pictureDimensions.height * this.pictureDimensions.width);
        // if (surfaceCovered > 0.15) {
        //     return "facile";
        // } else {
        //     return "difficile";
        // }
        return 0;
    }
}
