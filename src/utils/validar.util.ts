import { getPlatforms } from "@ionic/react";

const isnotMovileDevice = () =>{ return ( getPlatforms().includes("mobileweb"))};

export {isnotMovileDevice}