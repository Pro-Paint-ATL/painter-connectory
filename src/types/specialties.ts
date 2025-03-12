
export const PAINTER_SPECIALTIES = [
  "Interior Painting",
  "Exterior Painting",
  "Commercial Painting",
  "Residential Painting",
  "Cabinet Refinishing",
  "Deck Staining",
  "Fence Painting",
  "Wallpaper Removal",
  "Wallpaper Installation",
  "Drywall Repair",
  "Popcorn Ceiling Removal",
  "Texture Application",
  "Faux Finishing",
  "Color Consulting",
  "Pressure Washing",
  "Epoxy Floor Coating",
  "Lead Paint Removal",
  "Mural Painting",
  "Historic Restoration"
];

export const getSpecialtyIcon = (specialty: string) => {
  // Return appropriate icon name based on specialty
  // This can be expanded with more specialty-specific icons
  switch (specialty.toLowerCase()) {
    case "interior painting":
      return "home";
    case "exterior painting":
      return "home";
    case "commercial painting":
      return "building-2";
    case "residential painting":
      return "home";
    case "cabinet refinishing":
      return "layout-dashboard";
    case "deck staining":
      return "table";
    case "fence painting":
      return "separator-horizontal";
    case "wallpaper removal":
    case "wallpaper installation":
      return "scroll";
    case "drywall repair":
      return "hammer";
    case "popcorn ceiling removal":
      return "ceiling";
    case "texture application":
      return "brush";
    case "faux finishing":
      return "paint";
    case "color consulting":
      return "palette";
    case "pressure washing":
      return "shower-head";
    case "epoxy floor coating":
      return "layers";
    case "lead paint removal":
      return "alert-triangle";
    case "mural painting":
      return "image";
    case "historic restoration":
      return "building";
    default:
      return "brush";
  }
};
