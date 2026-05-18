import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  reference: string
  product_name: string
  price: number
  quantity: number
  unit: string
  paymentOptionReference: string
  paymentOptionName: string
  image?: string
  deposit_amount?: number
  duration_months?: number
  monthly_amount?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (reference: string, paymentOptionReference: string) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set: any, get: any) => ({
      items: [],
      addItem: (newItem: CartItem) => {
        const currentItems = get().items
        const existingItemIndex = currentItems.findIndex(
          (item: CartItem) => item.reference === newItem.reference && item.paymentOptionReference === newItem.paymentOptionReference
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += newItem.quantity
          set({ items: updatedItems })
        } else {
          set({ items: [...currentItems, newItem] })
        }
      },
      removeItem: (reference: string, paymentOptionReference: string) => {
        set({
          items: get().items.filter(
            (item: CartItem) => !(item.reference === reference && item.paymentOptionReference === paymentOptionReference)
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "suppco-cart-storage",
    }
  )
)
