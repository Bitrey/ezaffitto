import { RentalPost } from "./interfaces/RentalPost";

function generateTelegramMessageFromJson(parsed: RentalPost) {
  //let ret = JSON.stringify(parsed, null, 4)
  //TODO: Externalize into file


  const md_prezzo = parsed.monthlyPrice
    ? `\u{1F4B6} Prezzo: ${parsed.monthlyPrice}\n`
    : "";

  let md_prezzo_letto = "";
  if (parsed.rentalType && parsed.rentalType == "doubleRoom") {
    md_prezzo_letto = parsed.monthlyPricePerBed
      ? `\u{1f6cf} Prezzo letto: ${parsed.monthlyPricePerBed}\n`
      : "";
  }
  const md_smoking = parsed.smokingAllowed
    ? `\u{1f6ac} Fumatori: ${parsed.smokingAllowed}\n`
    : "";
  const md_tipo_alloggio = parsed.rentalType
    ? `\u{1F3f7} Tipo alloggio: ${parsed.rentalType}\n`
    : "";
  const md_start = parsed.availabilityStartDate
    ? `\u{23f1} Data inizio: ${parsed.availabilityStartDate}\n`
    : "";
  const md_end_date = parsed.availabilityEndDate
    ? `\u{23f1} Data fine: ${parsed.availabilityEndDate}\n`
    : "";
  const md_zone = parsed.zon

  const md_description = parsed.description 
  ? `${parsed.description}`
  : ""

  let md_response =
    "" +
    md_prezzo +
    md_prezzo_letto +
    md_tipo_alloggio +
    md_start +
    md_end_date +
    md_smoking+
    '\n\n'+
    md_description
    ;

  const ret = md_response
    .replace(/\_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\~/g, "\\~")
    .replace(/\`/g, "\\`")
    .replace(/\>/g, "\\>")
    .replace(/\#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/\-/g, "\\-")
    .replace(/\=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/\!/g, "\\!");

  return ret;
}

export { generateTelegramMessageFromJson };
