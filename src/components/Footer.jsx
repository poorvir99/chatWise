import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
      <footer className="w-full flex justify-center bg-white text-[#612DD1] text-center py-1">
        <p className="text-sm mr-2">&copy; {new Date().getFullYear()} chatWise</p>
    <a
        href="https://github.com/your-profile"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#612DD1] text-sm hover:text-gray-400 transition"
        >
      <FontAwesomeIcon icon={faGithub} />
    </a>
     
      </footer>
    );
  };
  
  export default Footer;

