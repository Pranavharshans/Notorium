declare module 'lamejs' {
  export interface Mp3Encoder {
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
    flush(): Int8Array;
  }

  export interface Mp3EncoderConstructor {
    new (numberOfChannels: number, sampleRate: number, kbps: number, mpegMode?: number): Mp3Encoder;
  }

  const Lame: {
    Mp3Encoder: Mp3EncoderConstructor;
  };

  export default Lame;
}