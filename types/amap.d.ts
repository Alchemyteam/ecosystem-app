// 高德地图API类型声明
declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: MapOptions);
    add(overlay: any | any[]): void;
    remove(overlay: any | any[]): void;
    setBounds(bounds: Bounds, immediately?: boolean, avoid?: number[]): void;
    destroy(): void;
  }

  interface MapOptions {
    zoom?: number;
    center?: number[];
    mapStyle?: string;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    getPosition(): LngLat;
    on(event: string, callback: () => void): void;
  }

  interface MarkerOptions {
    position?: number[];
    icon?: Icon;
    title?: string;
    offset?: Pixel;
  }

  class Icon {
    constructor(opts?: IconOptions);
  }

  interface IconOptions {
    size?: Size;
    image?: string;
    imageSize?: Size;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Pixel {
    constructor(x: number, y: number);
  }

  class LngLat {
    constructor(lng: number, lat: number);
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
  }

  interface PolylineOptions {
    path?: number[][];
    strokeColor?: string;
    strokeWeight?: number;
    strokeStyle?: string;
    lineJoin?: string;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map: Map, position: LngLat): void;
  }

  interface InfoWindowOptions {
    content?: string;
    offset?: Pixel;
  }

  class Bounds {
    constructor(southWest: LngLat, northEast: LngLat);
  }
}

interface Window {
  AMap: typeof AMap;
}

