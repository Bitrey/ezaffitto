import { FC } from "react";
import { isEzaffittoCity } from "../interfaces/RentalPost";
import RentFinder from "./RentFinder";
import ErrorDialog from "./ErrorDialog";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Container from "./Container";

interface IsEzaffittoCityProps {}

const IsEzaffittoCity: FC<IsEzaffittoCityProps> = () => {
  const { t } = useTranslation();
  const { city } = useParams<{ city: string }>();

  return city && isEzaffittoCity(city) ? (
    <RentFinder city={city} />
  ) : (
    <Container>
      <ErrorDialog
        title={t("errors.invalidCity")}
        error={t("errors.invalidCityDescription")}
        navigateToOnClose="/"
      />
    </Container>
  );
};

export default IsEzaffittoCity;
