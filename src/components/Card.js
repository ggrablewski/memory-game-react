import React from 'react';

function Card({ card, isFlipped, isMatched, coverImage, onCardClick }) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onCardClick(card.id);
    }
  };

  const getImageSrc = () => {
    if (isMatched) {
      return '';
    }
    if (isFlipped) {
      return `/inside_${card.value}.png`;
    }
    return coverImage;
  };

  if (isMatched) {
    return <div></div>;
  }

  return (
    <img
      src={getImageSrc()}
      alt="card"
      onClick={handleClick}
      style={{ cursor: isFlipped ? 'default' : 'pointer' }}
    />
  );
}

export default Card;
