import { RentalPost } from "./interfaces/RentalPost";

function generateTelegramMessageFromJson(parsed:RentalPost){
    //let ret = JSON.stringify(parsed, null, 4)
    //TODO: Externalize into file
    let md_response =  `
      	\u{1F4B6} Prezzo: ${parsed.monthlyPrice}
    `;

    return md_response
}

export {generateTelegramMessageFromJson}
