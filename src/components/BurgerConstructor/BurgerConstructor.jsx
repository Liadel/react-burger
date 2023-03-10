import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDrop } from 'react-dnd'
import { nanoid } from '@reduxjs/toolkit'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Modal from '../Modal/Modal'
import OrderDetails from '../OrderDetails/OrderDetails'
import { IngredientPropTypes } from '../../types/IngredientPropTypes'

import styles from './BurgerConstructor.module.css'
import ConstructorFooter from './ConstructorFooter/ConstructorFooter'
import ElementsContainer from './ElementsContainer/ElementsContainer'

import { sendOrder, clearOrder } from '../../services/orderSlice'
import { addIngredient } from '../../services/constructorItemsSlice'

BurgerConstructor.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape(IngredientPropTypes))
}

export default function BurgerConstructor(){
  const dispatch = useDispatch()
  const { ingredients, bun } = useSelector(state => state.constructorItems);
  const { number, loading } = useSelector(state => state.order) 

  const [{isHover}, dropTargetRef] = useDrop({
    accept: 'ingredient',
    collect: (monitor) => ({
      isHover: monitor.isOver()
    }),
    drop: (item) => {
      dispatch(addIngredient({
        ...item,
        dragId: nanoid()
      }))
    }
  })

  const handleOrderSend = async () => {
    const ingredientsToSend = [
      bun._id, 
      ...ingredients.map(({_id}) => _id), 
      bun._id
    ]
    try {
      dispatch(sendOrder({ingredients: ingredientsToSend}))  
    } catch(e) {
      console.log(e)
    }    
  }

  return (
    <section className={classnames(styles.wrapper, 'pt-25 pl-5 pr-5 pb-5')}>
      {number && <Modal onClose={() => dispatch(clearOrder())}><OrderDetails /></Modal>}
      <section 
        ref={dropTargetRef} 
        className={classnames(styles.constructor, {
          isHover: isHover ? styles.onHover : ''
        })}
      >
        <ElementsContainer bun={bun} ingredients={ingredients} />
      </section>
      <ConstructorFooter 
        price={getPrice({bun, ingredients})}
        disable={loading || !bun}
        handleClick={handleOrderSend}
      />
    </section>
  )
}

function getPrice({bun, ingredients}) {
  let accumulator = bun ? bun.price*2 : 0
  return ingredients.reduce((acc, {price}) => acc + price, accumulator)
}