import React from 'react'
import { ButtonWithIcon } from 'vtex.styleguide'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useCssHandles } from 'vtex.css-handles'

import { useMinicartDispatch, useMinicartState } from '../MinicartContext'
import styles from '../styles.css'

const CSS_HANDLES = ['minicartIconContainer', 'minicartQuantityBadge'] as const

interface Props {
  Icon: React.ComponentType
  quantityDisplay: QuantityDisplayType
  itemCountMode: MinicartTotalItemsType
}

const countCartItems = (
  countMode: MinicartTotalItemsType,
  arr: OrderFormItem[]
) => {
  if (countMode === 'distinctAvailable') {
    return arr.reduce((itemQuantity: number, item: OrderFormItem) => {
      if (item.availability === 'available') {
        return itemQuantity + 1
      }
      return itemQuantity
    }, 0)
  }

  if (countMode === 'totalAvailable') {
    return arr.reduce((itemQuantity: number, item: OrderFormItem) => {
      if (item.availability === 'available') {
        return itemQuantity + item.quantity
      }
      return itemQuantity
    }, 0)
  }

  if (countMode === 'total') {
    return arr.reduce((itemQuantity: number, item: OrderFormItem) => {
      return itemQuantity + item.quantity
    }, 0)
  }

  // countMode === 'distinct'
  return arr.length
}

const MinicartIconButton: React.FC<Props> = props => {
  const { Icon, itemCountMode, quantityDisplay } = props
  const { orderForm, loading }: OrderFormContext = useOrderForm()
  const handles = useCssHandles(CSS_HANDLES)
  const { open, openBehavior, openOnHoverProp } = useMinicartState()
  const dispatch = useMinicartDispatch()
  const quantity = countCartItems(itemCountMode, orderForm.items)
  const itemQuantity = loading ? 0 : quantity

  const handleClick = () => {
    if (openOnHoverProp) {
      if (openBehavior === 'hover') {
        dispatch({
          type: 'SET_OPEN_BEHAVIOR',
          value: 'click',
        })

        return
      }

      dispatch({ type: 'CLOSE_MINICART' })
      dispatch({
        type: 'SET_OPEN_BEHAVIOR',
        value: 'hover',
      })

      return
    }

    dispatch({ type: open ? 'CLOSE_MINICART' : 'OPEN_MINICART' })
  }

  const showQuantityBadge =
    (itemQuantity > 0 && quantityDisplay === 'not-empty') ||
    quantityDisplay === 'always'

  return (
    <ButtonWithIcon
      icon={
        <span className={`${handles.minicartIconContainer} gray relative`}>
          <Icon />
          {showQuantityBadge && (
            <span
              style={{ userSelect: 'none' }}
              className={`${handles.minicartQuantityBadge} ${styles.minicartQuantityBadgeDefault} c-on-emphasis absolute t-mini bg-emphasis br4 w1 h1 pa1 flex justify-center items-center lh-solid`}
            >
              {itemQuantity}
            </span>
          )}
        </span>
      }
      variation="tertiary"
      onMouseEnter={
        openBehavior === 'hover'
          ? () => dispatch({ type: 'OPEN_MINICART' })
          : undefined
      }
      onClick={handleClick}
    />
  )
}

export default MinicartIconButton
