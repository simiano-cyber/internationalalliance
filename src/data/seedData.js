export const seedData = {
  members: [
    {
      id: "member-demo-001",
      name: "Alex Monte Claro",
      initials: "AM",
      country: "Brasil",
      countryCode: "BR",
      city: "São Paulo",
      languages: ["Português", "Inglês"],
      lodge: "Loja Demonstrativa Aurora Azul",
      obedience: "Organização Demonstrativa Fraterna",
      degree: "Mestre Maçom",
      verified: true,
      availableForContact: true,
      bio: "Perfil fictício criado somente para demonstrar o funcionamento do MVP.",
      avatar: null,
      privacy: {
        showLodge: true,
        showObedience: true,
        showCity: true
      }
    },
    {
      id: "member-demo-002",
      name: "Bruno Vale Norte",
      initials: "BV",
      country: "Portugal",
      countryCode: "PT",
      city: "Lisboa",
      languages: ["Português", "Espanhol"],
      lodge: "Loja Demonstrativa Ponte Serena",
      obedience: "Federação Demonstrativa Internacional",
      degree: "Mestre Maçom",
      verified: true,
      availableForContact: true,
      bio: "Dado demonstrativo, sem relação com pessoa, loja ou potência real.",
      avatar: null,
      privacy: {
        showLodge: false,
        showObedience: true,
        showCity: true
      }
    },
    {
      id: "member-demo-003",
      name: "Carlos Meridian Gray",
      initials: "CG",
      country: "Reino Unido",
      countryCode: "GB",
      city: "Londres",
      languages: ["Inglês", "Francês"],
      lodge: "Loja Demonstrativa Meridian",
      obedience: "Aliança Demonstrativa Global",
      degree: "Mestre Maçom",
      verified: false,
      availableForContact: false,
      bio: "Registro fictício usado apenas para estruturar a demonstração.",
      avatar: null,
      privacy: {
        showLodge: true,
        showObedience: false,
        showCity: true
      }
    }
  ],
  contactRequests: [],
  pendingVerifications: ["member-demo-003"]
};
