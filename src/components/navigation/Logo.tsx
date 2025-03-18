
import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

interface LogoProps {
  city: { city: string; state: string; code: string };
}

const Logo = ({ city }: LogoProps) => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <BrandLogo />
      <span className="font-semibold text-xl">Pro Paint {city.code}</span>
    </Link>
  );
};

export default Logo;
