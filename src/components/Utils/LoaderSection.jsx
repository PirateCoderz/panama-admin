import Image from "next/image";

const LoaderSection = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Logo / Brand */}
            <div className="flex items-center mb-6">
                <Image
                    src="/images/panamatravellogo.png" // 👈 replace with your logo path in /public
                    width={150}
                    height={48}
                    alt="Panama Travel"
                    className="h-12 w-auto mr-3 animate-bounce"
                />
                <h1 className="text-2xl font-bold text-blue-800 tracking-wide">
                    Panama Travel
                </h1>
            </div>

            {/* Spinner */}
            <div className="relative w-14 h-14">
                <div className="absolute top-0 left-0 w-14 h-14 border-4 border-blue-300 rounded-full animate-spin border-t-blue-600"></div>
            </div>

            {/* Loading message */}
            <p className="mt-6 text-gray-600 text-lg animate-pulse">
                Preparing your journey...
            </p>
        </div>
    );
};

export default LoaderSection;
