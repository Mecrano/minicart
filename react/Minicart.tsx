import React, { FC } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { BackdropMode } from 'vtex.store-drawer'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { MaybeResponsiveValue } from 'vtex.responsive-values'
import { IconCart } from 'vtex.store-icons'
import { useCheckoutURL } from 'vtex.checkout-resources/Utils'
import { PixelData } from 'vtex.pixel-manager/react/PixelContext'

import MinicartIconButton from './components/MinicartIconButton'
import DrawerMode from './components/DrawerMode'
import { MinicartContextProvider, useMinicartState } from './MinicartContext'
import PopupMode from './components/Popup'
import useCartIdPixel from './modules/useCartIdPixel'

const CSS_HANDLES = ['minicartWrapperContainer', 'minicartContainer'] as const

interface MinicartProps {
  variation: MinicartVariationType
  openOnHover: boolean
  linkVariationUrl: string
  maxDrawerWidth: number | string
  MinicartIcon: React.ComponentType
  drawerSlideDirection: SlideDirectionType
  quantityDisplay: QuantityDisplayType
  itemCountMode: MinicartTotalItemsType
  backdropMode: MaybeResponsiveValue<BackdropMode>
  customPixelEventId: string
  customPixelEventName: PixelData['event']
}

const Minicart: FC<Partial<MinicartProps>> = ({
  children,
  backdropMode,
  linkVariationUrl,
  maxDrawerWidth = 400,
  MinicartIcon = IconCart,
  quantityDisplay = 'not-empty',
  itemCountMode = 'distinct',
  drawerSlideDirection = 'rightToLeft',
  customPixelEventId,
  customPixelEventName,
}) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { variation } = useMinicartState()
  const { url: checkoutUrl } = useCheckoutURL()

  const getMinicartVariation = () => {
    switch (variation) {
      case 'link':
        return (
          <a href={linkVariationUrl ?? checkoutUrl}>
            <MinicartIconButton
              Icon={MinicartIcon}
              itemCountMode={itemCountMode}
              quantityDisplay={quantityDisplay}
            />
          </a>
        )

      case 'drawer':
        return (
          <DrawerMode
            Icon={MinicartIcon}
            backdropMode={backdropMode}
            itemCountMode={itemCountMode}
            maxDrawerWidth={maxDrawerWidth}
            quantityDisplay={quantityDisplay}
            drawerSlideDirection={drawerSlideDirection}
            customPixelEventId={customPixelEventId}
            customPixelEventName={customPixelEventName}
          >
            {children}
          </DrawerMode>
        )

      case 'alwaysOpen':
        return children

      default:
        return (
          <PopupMode
            Icon={MinicartIcon}
            itemCountMode={itemCountMode}
            quantityDisplay={quantityDisplay}
            customPixelEventId={customPixelEventId}
            customPixelEventName={customPixelEventName}
          >
            {children}
          </PopupMode>
        )
    }
  }

  return (
    <aside
      className={`${handles.minicartWrapperContainer} relative fr flex items-center`}
    >
      <div className={`${handles.minicartContainer} flex flex-column`}>
        {getMinicartVariation()}
      </div>
    </aside>
  )
}

const CartIdPixel = () => {
  const { orderForm, loading }: OrderFormContext = useOrderForm()

  const orderFormId = !loading && orderForm ? orderForm.id : undefined

  useCartIdPixel(orderFormId)

  return null
}

const EnhancedMinicart = (props: MinicartProps) => (
  <MinicartContextProvider
    variation={props.variation}
    openOnHover={props.openOnHover}
  >
    <CartIdPixel />
    <Minicart {...props} />
  </MinicartContextProvider>
)

export default EnhancedMinicart
