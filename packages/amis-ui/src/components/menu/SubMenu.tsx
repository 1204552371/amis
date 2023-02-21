/**
 * @file SubMenu
 * @description 导航子菜单
 * @author fex
 */

import React from 'react';
import pick from 'lodash/pick';
import {SubMenu as RcSubMenu, SubMenuProps as RcSubMenuProps} from 'rc-menu';
import {ClassNamesFn, themeable, autobind, createObject} from 'amis-core';

import {getIcon} from '../icons';
import {Badge} from '../Badge';
import {MenuContextProps, MenuContext} from './MenuContext';
import type {NavigationItem} from './';

const CaretIcon = getIcon('caret') as any;
const DragIcon = getIcon('drag-bar') as any;

interface MenuItemTitleInfo {
  key: string;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

export interface SubMenuProps
  extends Omit<NavigationItem, 'children'>,
    Omit<RcSubMenuProps, 'expandIcon'> {
  depth?: number;
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
  classPrefix: string;
  classnames: ClassNamesFn;
  popupClassName?: string;
  onTitleMouseEnter?: (e: MenuItemTitleInfo) => void;
  onTitleMouseLeave?: (e: MenuItemTitleInfo) => void;
  onTitleClick?: (e: MenuItemTitleInfo) => void;
  renderLink: Function;
  [propName: string]: any;
}

export class SubMenu extends React.Component<SubMenuProps> {
  static contextType = MenuContext;

  /**
   * Menu上下文数据
   *
   * @type {MenuContextProps}
   * @memberof SubMenu
   */
  context: MenuContextProps;

  /**
   * 内部使用的属性
   *
   * @memberof SubMenu
   */
  internalProps = [
    'key',
    'style',
    'className',
    'title',
    'children',
    'disabled',
    'eventKey',
    'warnKey',
    'itemIcon',
    'expandIcon',
    'onMouseEnter',
    'onMouseLeave',
    'popupClassName',
    'popupOffset',
    'onClick',
    'onTitleClick',
    'onTitleMouseEnter',
    'onTitleMouseLeave'
  ];

  @autobind
  handleSubmenuTitleActived({key, domEvent}: MenuItemTitleInfo) {
    const {onSubmenuClick, stacked} = this.context;

    stacked && onSubmenuClick?.({key, domEvent, props: this.props});
  }

  getDynamicStyle(hasIcon: boolean) {
    const {stacked} = this.context;
    const {depth} = this.props;
    const isHorizontal = !stacked;
    const indentWidth = `(
      ${hasIcon ? 'var(--Menu-icon-size) + var(--gap-sm) +' : ''}
      ${
        isHorizontal
          ? 'var(--Menu-Submenu-title-paddingX) * 2'
          : depth === 1
          ? '0px'
          : 'var(--Menu-Submenu-title-paddingX)'
      }
    )`;

    return {
      maxWidth: isHorizontal
        ? `calc(var(--Menu-width) - ${indentWidth})`
        : `calc(100% - ${indentWidth})`
    };
  }

  /** 检查icon参数值是否为文件路径 */
  isImgPath(raw: string) {
    return (
      typeof raw === 'string' &&
      (!!~raw.indexOf('.') || /^\/images\//.test(raw))
    );
  }

  renderSubMenuTitle() {
    const {collapsed, stacked, mode, draggable, onDragStart} = this.context;
    const {
      classnames: cx,
      id,
      label,
      icon,
      path,
      depth,
      badge,
      badgeClassName,
      disabled,
      data: defaultData,
      extra,
      renderLink
    } = this.props;
    const isCollapsedNode = collapsed && depth === 1;
    const link =
      renderLink && typeof renderLink === 'function'
        ? renderLink(this.props)
        : path || '';
    const iconNode = icon ? (
      typeof icon === 'string' ? (
        this.isImgPath(icon) ? (
          <div className={cx(`Menu-item-icon`)}>
            <img width="14px" src={icon} />
          </div>
        ) : (
          <i
            key="icon"
            className={cx(`Menu-item-icon`, icon, {
              ['Menu-item-icon-collapsed']: isCollapsedNode
            })}
          />
        )
      ) : React.isValidElement(icon) ? (
        React.cloneElement(icon as React.ReactElement, {
          className: cx(`Menu-item-icon`, icon.props?.className, {
            ['Menu-item-icon-svg-collapsed']: isCollapsedNode
          })
        })
      ) : null
    ) : null;
    const labelNode =
      label && typeof label === 'string' ? (
        <span
          className={cx('Nav-Menu-item-label', {
            ['Nav-Menu-item-label-collapsed']: isCollapsedNode,
            ['Nav-Menu-item-label-subTitle']: !isCollapsedNode
          })}
          title={isCollapsedNode ? '' : label}
          style={this.getDynamicStyle(!!iconNode)}
        >
          {isCollapsedNode ? label.slice(0, 1) : label}
        </span>
      ) : React.isValidElement(label) ? (
        React.cloneElement(label as any, {
          className: cx(
            'Nav-Menu-item-label',
            (label as any)?.props?.className,
            {
              ['Nav-Menu-item-label-collapsed']: isCollapsedNode,
              ['Nav-Menu-item-label-subTitle']: !isCollapsedNode
            }
          ),
          style: this.getDynamicStyle(!!iconNode)
        })
      ) : null;
    const dragNode =
      !disabled && stacked && mode === 'inline' && !collapsed && draggable ? (
        <span className={cx('Nav-Menu-item-dragBar')} draggable>
          <DragIcon />
        </span>
      ) : null;

    const renderContent = () => {
      return isCollapsedNode ? (
        <>{iconNode || labelNode}</>
      ) : (
        <>
          {dragNode}
          {iconNode}
          {labelNode}
          {!stacked ? (
            <span key="expand-toggle" className={cx('Nav-Menu-submenu-arrow')}>
              <CaretIcon />
            </span>
          ) : null}
        </>
      );
    };

    return (
      <div className={cx('Nav-Menu-item-wrap')}>
        <Badge
          classnames={cx}
          badge={badge ? {...badge, className: badgeClassName} : null}
          data={createObject(defaultData, link)}
        >
          <a
            className={cx(`Nav-Menu-item-link`)}
            data-id={link?.__id || id}
            data-depth={depth}
            onDragStart={onDragStart?.(link)}
          >
            {renderContent()}
          </a>
        </Badge>
        {extra ? (
          <div className={cx('Nav-Menu-item-extra')}>{extra}</div>
        ) : null}
      </div>
    );
  }

  render() {
    const {
      className,
      popupClassName,
      classnames: cx,
      hidden,
      active
    } = this.props;

    const isDarkTheme = this.context.themeColor === 'dark';
    return hidden ? null : (
      <RcSubMenu
        {...pick(this.props, this.internalProps)}
        className={cx(
          'Nav-Menu-submenu',
          {
            ['Nav-Menu-submenu-dark']: isDarkTheme,
            ['Nav-Menu-submenu-actived']: active
          },
          className
        )}
        popupClassName={cx(
          'Nav-Menu-submenu-popup',
          {
            ['Nav-Menu-submenu-popup-dark']: isDarkTheme
          },
          popupClassName
        )}
        title={this.renderSubMenuTitle()}
        onTitleClick={this.handleSubmenuTitleActived}
      />
    );
  }
}

export default themeable(SubMenu);
