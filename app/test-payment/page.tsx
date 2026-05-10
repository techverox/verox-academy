import RazorpayCheckout from "@/components/RazorpayCheckout";

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Verox Academy</h1>
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Course: Full-Stack Web Development</p>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Price:</span>
            <span className="text-2xl font-bold text-white">₹1.00</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            This is a test payment. You will be using Razorpay's test mode.
          </p>
          
          <RazorpayCheckout 
            amount={100} // 100 paise = ₹1
            courseName="Full-Stack Web Development"
            courseId="test_course_1"
          />
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Secure payment powered by Razorpay
        </div>
      </div>
    </div>
  );
}
