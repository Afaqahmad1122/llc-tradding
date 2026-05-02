import { Router } from "express";

import {
  getDestinationCountries,
  getDestinationPorts,
  getFxRates,
} from "../controllers/reference.controller.js";

export const referenceRouter = Router();

referenceRouter.get("/destination-countries", getDestinationCountries);
referenceRouter.get("/destination-ports", getDestinationPorts);
referenceRouter.get("/fx-rates", getFxRates);
