import { HTMLAttributes, RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import throttle from 'lodash.throttle';
import { CSSTransition } from 'react-transition-group';
import './Dropdown.css';

interface DropdownProps extends HTMLAttributes<HTMLElement> {
  targetRef: RefObject<HTMLElement>;
  shown: boolean;
  onShownChange: (shown: boolean) => void;
}

const calcCoords = (targetElement: HTMLElement) => {
  const rect = targetElement.getBoundingClientRect();
  return {
    top: window.scrollY + rect.bottom + 12,
    right: window.innerWidth - rect.right - window.scrollX,
  };
};
export const Dropdown = ({
  targetRef,
  children,
  shown,
  onShownChange,
  className,
  style,
  ...restProps
}: DropdownProps) => {
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setCoords(calcCoords(targetRef.current as HTMLElement));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    onShownChange(shown);
  }, [shown, onShownChange]);

  useEffect(() => {
    const documentClickListener = (e: MouseEvent) => {
      onShownChange(false);
    };
    if (shown) {
      document.addEventListener('click', documentClickListener);
    }
    return () => {
      document.removeEventListener('click', documentClickListener);
    };
  }, [shown, onShownChange]);

  useEffect(() => {
    const windowResizeListener = throttle(() => {
      setCoords(calcCoords(targetRef.current as HTMLElement));
    }, 100);

    if (shown) {
      document.addEventListener('resize', windowResizeListener);
    }
    return () => {
      document.removeEventListener('resize', windowResizeListener);
    };
  }, [shown, onShownChange, setCoords, targetRef]);

  return createPortal(
    <CSSTransition
      in={shown}
      timeout={200}
      mountOnEnter={true}
      unmountOnExit={true}
      classNames="dropdown-animation"
    >
      <div {...restProps} className={cx('dropdown', className)} style={{ ...style, ...coords }}>
        {children}
      </div>
    </CSSTransition>,
    document.getElementById('overlay') as HTMLElement,
  );
};
