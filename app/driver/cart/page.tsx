import { requireDriver } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DriverHeader from "@/app/components/DriverComponents/DriverHeader";
import CartItemCard from "@/app/components/cart/cart-item-card";
import CheckoutButton from "@/app/components/cart/checkout-button";

export default async function CartPage() {
  const user = await requireDriver();
  const driverProfile = user.driverProfile!;

  // Get cart with items
  const carts = await prisma.cart.findMany({
    where: { driverProfileId: driverProfile.id },
    include: {
      sponsor: true,
      items: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const cartsWithBalance = await Promise.all(
    carts.map(async (cart) => {
      let balance = 0;
      if (cart.sponsorId) {
        const sponsorship = await prisma.sponsoredBy.findUnique({
          where: {
            driverId_sponsorOrgId: {
              driverId: driverProfile.id,
              sponsorOrgId: cart.sponsorId,
            },
          },
        });
        balance = sponsorship?.points ?? 0;
      }
      const totalPoints = cart.items.reduce(
        (sum, item) => sum + item.pointPrice * item.quantity, 0
      );
      return {
        ...cart,
        balance,
        totalPoints,
        canCheckout: cart.items.length > 0 && balance >= totalPoints,
        pointsNeeded: totalPoints > balance ? totalPoints - balance : 0,
      };
    })
  );

/*
  const cartItems = cart?.items || [];
  const totalPoints = cartItems.reduce(
    (sum, item) => sum + item.pointPrice * item.quantity,
    0,
  );

  const sponsorships = await prisma.sponsoredBy.findMany({
    where: {driverId: driverProfile.id},
    include: { sponsorOrg: true },
  })

  const totalBalance = sponsorships.reduce((sum, s) => sum + s.points, 0);
  const canCheckout = cartItems.length > 0 && currentBalance >= totalPoints;
  const pointsNeeded =
    totalPoints > currentBalance ? totalPoints - currentBalance : 0;
*/
  return (
    <div>
      <DriverHeader />

      <div className="pt-20 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Link href="/driver/catalog" className="text-blue-600 hover:underline">
          ← Continue Shopping
        </Link>
      </div> 


    {cartsWithBalance.length === 0 ? (
    <div className="text-center py-16 bg-gray-50 rounded-lg">
      <p className="text-gray-600 mb-4">Your cart is empty</p>
      <Link href="/driver/catalog" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Browse Products
      </Link>
    </div>
    ) : (
    <div className="space-y-12">
      {cartsWithBalance.map((cart) => (
        <div key={cart.id}>
          <h2 className="text-xl font-bold mb-4">
            {cart.sponsor?.name ?? "Unknown Sponsor"}
          </h2>
      {/* Balance Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm mb-1">Your {cart.sponsor?.name} Points</p>
            <p className="text-3xl font-bold">{cart.balance.toLocaleString()} points</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm mb-1">Cart Total</p>
            <p className="text-3xl font-bold">
              {cart.totalPoints.toLocaleString()} points
            </p>
          </div>
        </div>
        {cart.pointsNeeded > 0 && (
          <div className="mt-4 bg-red-500 bg-opacity-30 border border-red-300 rounded px-4 py-2">
            <p className="text-sm">
              ⚠️ You need {cart.pointsNeeded.toLocaleString()} more points to
              complete this purchase
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cart.items.length})</span>
                <span>{cart.totalPoints.toLocaleString()} points</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">
                  {cart.totalPoints.toLocaleString()} points
                </span>
              </div>
            </div>
            <CheckoutButton
              canCheckout={cart.canCheckout}
              totalPoints={cart.totalPoints}
              pointsNeeded={cart.pointsNeeded}
            />
          </div>
        </div>
      </div>
    </div>
    ))}
    </div>
    )}
  </div>
</div>
);
}
