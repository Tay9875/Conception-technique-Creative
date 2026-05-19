import '../styles/ReportForm.css';
import { SquareButton } from './SquareButton';

interface ReportFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export default function ReportForm({ onCancel, onSubmit }: ReportFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      aria-labelledby="modal-title" // correspond au titre de la modale AccessibleModal
    >
      <fieldset className="report-fieldset">
        {/* Texte explicatif */}
        <div className="report-warning">
          <p>
            Vous êtes sur le point de signaler ce contenu comme inapproprié ou dangereux.
          </p>
        </div>

        {/* Boutons */}
        <div className="report-options">
          <SquareButton
            className="sqr-button-background centered-button"
            type="button"
            onClick={onCancel}
            aria-label="Annuler le signalement"
          >
            Annuler
          </SquareButton>

          <SquareButton
            className="sqr-button-red centered-button"
            type="submit"
            aria-label="Confirmer le signalement"
          >
            Signaler
          </SquareButton>
        </div>
      </fieldset>
    </form>
  );
}
