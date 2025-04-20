export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/it/thumb/4/4a/Emblema_CRI.svg/800px-Emblema_CRI.svg.png" 
              alt="CRI Logo" 
              className="h-10 mb-2"
            />
            <p className="text-gray-300 text-sm">© {new Date().getFullYear()} Croce Rossa Italiana - Comitato di Acqui Terme</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
