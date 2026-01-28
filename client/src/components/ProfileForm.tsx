import React, { FormEvent, useState } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/ProfileForm.css";

interface ProfileFormProps {
  initialData: {
    firstname: string;
    lastname: string;
    email: string;
  };
  onSubmit: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
  }) => void;
}

export default function ProfileForm({
  initialData,
  onSubmit,
}: ProfileFormProps) {
  const [firstname, setFirstname] = useState(initialData.firstname);
  const [lastname, setLastname] = useState(initialData.lastname);
  const [email, setEmail] = useState(initialData.email);
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit({
      firstname,
      lastname,
      email,
      ...(password && { password }),
    });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-field">
        <label htmlFor="firstname">Prénom</label>
        <input
          id="firstname"
          type="text"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="Ex : Thomas"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="lastname">Nom</label>
        <input
          id="lastname"
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="Ex : Dubois"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="nom@exemple.com"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="password">
          Nouveau mot de passe
          <span className="sr-only"> (optionnel)</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="textInput"
          placeholder="Laisser vide pour ne pas changer"
          aria-describedby="password-help"
        />
        <p id="password-help" className="sr-only">
          Laissez ce champ vide si vous ne souhaitez pas modifier votre mot de passe
        </p>
      </div>

      <SquareButton
        type="submit"
        className="sqr-button-dark-background btn-option"
        aria-label="Enregistrer les modifications du profil"
      >
        Enregistrer les modifications
      </SquareButton>
    </form>
  );
}
