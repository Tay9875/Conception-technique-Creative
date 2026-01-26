import React from "react";
import "../styles/ReportForm.css"
import { SquareButton } from "./SquareButton.tsx";

interface ReportFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export default function ReportForm({
  onCancel,
  onSubmit,
}: ReportFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      aria-labelledby="report-title"
    >
      <fieldset className="report-fieldset">
        <div className="report-warning">
            <p>
            Vous êtes sur le point de signaler ce contenu comme inapproprié ou dangereux.
            </p>
        </div>
        
        <div className="report-options">
          <SquareButton
            className="sqr-button-background centered-button"
            type="button"
            onClick={onCancel}
          >
            Annuler
          </SquareButton>

          <SquareButton
            className="sqr-button-red centered-button"
            type="submit"
          >
            Signaler
          </SquareButton>
        </div>
      </fieldset>
    </form>
  );
}
