import {
  BankFilled,
  ExportOutlined,
  FormOutlined,
  FunctionOutlined,
  ProfileOutlined,
  SafetyCertificateFilled,
  SettingFilled,
  SettingOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { List, Menu, Tooltip } from 'antd';
import logo from 'app/assets/images/logo.svg';
import { Avatar, MenuListItem, Popup } from 'app/components';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import {
  selectCurrentOrganization,
  selectDownloadPolling,
  selectOrganizationListLoading,
  selectOrgId,
} from 'app/pages/MainPage/slice/selectors';
import { getOrganizations } from 'app/pages/MainPage/slice/thunks';
import { selectLoggedInUser } from 'app/slice/selectors';
import { logout } from 'app/slice/thunks';
import { downloadFile } from 'app/utils/fetch';
import { BASE_RESOURCE_URL } from 'globalConstants';
import React, { cloneElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';
import {
  BORDER_RADIUS,
  FONT_SIZE_ICON_SM,
  FONT_WEIGHT_MEDIUM,
  NAV_LEVEL,
  SPACE_LG,
  SPACE_MD,
  SPACE_TIMES,
  SPACE_XS,
} from 'styles/StyleConstants';
import { Access } from '../Access';
import {
  PermissionLevels,
  ResourceTypes,
} from '../pages/PermissionPage/constants';
import { useMainSlice } from '../slice';
import { DownloadListPopup } from './DownloadListPopup';
import { ModifyPassword } from './ModifyPassword';
import { OrganizationList } from './OrganizationList';
import { Profile } from './Profile';
import { loadTasks } from './service';

export function Navbar() {
  const { actions } = useMainSlice();
  const [profileVisible, setProfileVisible] = useState(false);
  const [modifyPasswordVisible, setModifyPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const orgId = useSelector(selectOrgId);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const loggedInUser = useSelector(selectLoggedInUser);
  const organizationListLoading = useSelector(selectOrganizationListLoading);
  const downloadPolling = useSelector(selectDownloadPolling);
  const matchModules = useRouteMatch<{ moduleName: string }>(
    '/organizations/:orgId/:moduleName',
  );
  const { i18n } = useTranslation();
  const t = useI18NPrefix('main');
  const brandClick = useCallback(() => {
    history.push('/');
  }, [history]);

  const hideProfile = useCallback(() => {
    setProfileVisible(false);
  }, []);
  const hideModifyPassword = useCallback(() => {
    setModifyPasswordVisible(false);
  }, []);

  const organizationListVisibleChange = useCallback(
    visible => {
      if (visible && !organizationListLoading) {
        dispatch(getOrganizations());
      }
    },
    [dispatch, organizationListLoading],
  );

  const subNavs = useMemo(
    () => [
      {
        name: 'variables',
        title: t('subNavs.variables.title'),
        icon: <FunctionOutlined />,
        module: ResourceTypes.Manager,
      },
      {
        name: 'orgSettings',
        title: t('subNavs.orgSettings.title'),
        icon: <SettingOutlined />,
        module: ResourceTypes.Manager,
      },
    ],
    [],
  );

  const navs = useMemo(
    () => [
      {
        name: 'vizs',
        title: t('nav.vizs'),
        icon: <i className="iconfont icon-xietongzhihuidaping" />,
        module: ResourceTypes.Viz,
      },
      {
        name: 'views',
        title: t('nav.views'),
        icon: <i className="iconfont icon-24gf-table" />,
        module: ResourceTypes.View,
      },
      {
        name: 'sources',
        title: t('nav.sources'),
        icon: <i className="iconfont icon-shujukupeizhi" />,
        module: ResourceTypes.Source,
      },
      {
        name: 'schedules',
        title: t('nav.schedules'),
        icon: <i className="iconfont icon-fasongyoujian" />,
        module: ResourceTypes.Schedule,
      },
      {
        name: 'members',
        title: t('nav.members'),
        icon: <i className="iconfont icon-users1" />,
        isActive: (_, location) =>
          !!location.pathname.match(
            /\/organizations\/[\w]{32}\/(members|roles)/,
          ),
        module: ResourceTypes.User,
      },
      {
        name: 'permissions',
        title: t('nav.permissions'),
        icon: <SafetyCertificateFilled />,
        module: ResourceTypes.Manager,
      },
      {
        name: 'toSub',
        title: t('nav.settings'),
        icon: <SettingFilled />,
        isActive: (_, location) => {
          const reg = new RegExp(
            `\\/organizations\\/[\\w]{32}\\/(${subNavs
              .map(({ name }) => name)
              .join('|')})`,
          );
          return !!location.pathname.match(reg);
        },
        module: ResourceTypes.Manager,
      },
    ],
    [subNavs],
  );

  const showSubNav = useMemo(
    () => subNavs.some(({ name }) => name === matchModules?.params.moduleName),
    [matchModules?.params.moduleName, subNavs],
  );

  const userMenuSelect = useCallback(
    ({ key }) => {
      switch (key) {
        case 'profile':
          setProfileVisible(true);
          break;
        case 'logout':
          dispatch(
            logout(() => {
              history.replace('/');
            }),
          );
          break;
        case 'password':
          setModifyPasswordVisible(true);
          break;
        case 'zh':
          i18n.changeLanguage('zh');
          break;
        case 'en':
          i18n.changeLanguage('en');
          break;
        default:
          break;
      }
    },
    [dispatch, history, i18n],
  );

  const onSetPolling = useCallback(
    (polling: boolean) => {
      dispatch(actions.setDownloadPolling(polling));
    },
    [dispatch, actions],
  );
  return (
    <>
      <MainNav>
        <Brand onClick={brandClick}>
          <img src={logo} alt="logo" />
        </Brand>
        <Nav>
          {navs.map(({ name, title, icon, isActive, module }) => {
            return name !== 'toSub' || subNavs.length > 0 ? (
              <Access
                key={name}
                type="module"
                module={module}
                level={PermissionLevels.Enable}
              >
                <Tooltip title={title} placement="right">
                  <NavItem
                    to={`/organizations/${orgId}/${
                      name === 'toSub' ? subNavs[0].name : name
                    }`}
                    activeClassName="active"
                    {...(isActive && { isActive })}
                  >
                    {icon}
                  </NavItem>
                </Tooltip>
              </Access>
            ) : null;
          })}
        </Nav>
        <Toolbar>
          <DownloadListPopup
            polling={downloadPolling}
            setPolling={onSetPolling}
            onLoadTasks={loadTasks}
            onDownloadFile={item => {
              if (item.id) {
                downloadFile(item.id).then(() => {
                  dispatch(actions.setDownloadPolling(true));
                });
              }
            }}
          />
          <Popup
            content={<OrganizationList />}
            trigger={['click']}
            placement="rightBottom"
            onVisibleChange={organizationListVisibleChange}
          >
            <li>
              <Avatar
                src={`${BASE_RESOURCE_URL}${currentOrganization?.avatar}`}
              >
                <BankFilled />
              </Avatar>
            </li>
          </Popup>
          <Popup
            content={
              <Menu
                prefixCls="ant-dropdown-menu"
                selectable={false}
                onClick={userMenuSelect}
              >
                <MenuListItem
                  key="profile"
                  prefix={<ProfileOutlined className="icon" />}
                >
                  <p>{t('nav.accout.accountSettings.title')}</p>
                </MenuListItem>
                <MenuListItem
                  key="password"
                  prefix={<FormOutlined className="icon" />}
                >
                  <p>{t('nav.accout.changePassword.title')}</p>
                </MenuListItem>

                <Menu.SubMenu
                  icon={<SwapOutlined className="icon" />}
                  key="language"
                  title={t('nav.accout.switchLanguage.title')}
                >
                  <Menu.Item key="zh">中文</Menu.Item>
                  <Menu.Item key="en">English</Menu.Item>
                </Menu.SubMenu>
                <MenuListItem
                  key="logout"
                  prefix={<ExportOutlined className="icon" />}
                >
                  <p>{t('nav.accout.logout.title')}</p>
                </MenuListItem>
              </Menu>
            }
            trigger={['click']}
            placement="rightBottom"
          >
            <li>
              <Avatar src={`${BASE_RESOURCE_URL}${loggedInUser?.avatar}`}>
                <UserOutlined />
              </Avatar>
            </li>
          </Popup>
        </Toolbar>
        <Profile visible={profileVisible} onCancel={hideProfile} />
        <ModifyPassword
          visible={modifyPasswordVisible}
          onCancel={hideModifyPassword}
        />
      </MainNav>
      {showSubNav && (
        <SubNav>
          <List
            dataSource={subNavs}
            renderItem={({ name, title, icon }) => (
              <SubNavTitle
                key={name}
                to={`/organizations/${orgId}/${name}`}
                activeClassName="active"
              >
                {cloneElement(icon, { className: 'prefix' })}
                <h4>{title}</h4>
              </SubNavTitle>
            )}
          />
        </SubNav>
      )}
    </>
  );
}

const MainNav = styled.div`
  z-index: ${NAV_LEVEL};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${SPACE_TIMES(20)};
  background-color: ${p => p.theme.componentBackground};
  border-right: 1px solid ${p => p.theme.borderColorSplit};
`;

const Brand = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: ${SPACE_TIMES(18)};
  padding-top: ${SPACE_XS};
  cursor: pointer;

  img {
    width: ${SPACE_TIMES(9)};
    height: ${SPACE_TIMES(9)};
  }
`;

const Nav = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 ${SPACE_LG};
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${SPACE_XS} 0;
  margin: ${SPACE_XS} 0;
  color: ${p => p.theme.textColorDisabled};
  border-radius: ${BORDER_RADIUS};
  transition: none;

  &:hover,
  &.active {
    color: ${p => p.theme.primary};
    background-color: ${p => p.theme.emphasisBackground};

    h2 {
      font-weight: ${FONT_WEIGHT_MEDIUM};
      color: ${p => p.theme.textColor};
    }
  }

  .anticon {
    font-size: ${FONT_SIZE_ICON_SM};
  }
`;

const Toolbar = styled.ul`
  flex-shrink: 0;
  padding: 0 ${SPACE_LG};
  margin-bottom: ${SPACE_LG};

  > li {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${SPACE_XS} 0;
    margin: ${SPACE_MD} 0;
    font-size: ${FONT_SIZE_ICON_SM};
    color: ${p => p.theme.textColorDisabled};
    cursor: pointer;
    border-radius: ${BORDER_RADIUS};

    &:hover {
      color: ${p => p.theme.primary};
      background-color: ${p => p.theme.bodyBackground};
    }
  }
`;

const SubNav = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${SPACE_TIMES(64)};
  padding: ${SPACE_MD} 0;
  background-color: ${p => p.theme.componentBackground};
  border-right: 1px solid ${p => p.theme.borderColorSplit};
`;

const SubNavTitle = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${SPACE_XS} ${SPACE_LG} ${SPACE_XS} ${SPACE_LG};
  color: ${p => p.theme.textColorSnd};

  .prefix {
    flex-shrink: 0;
    margin-right: ${SPACE_XS};
    color: ${p => p.theme.textColorLight};
  }

  h4 {
    flex: 1;
    font-weight: ${FONT_WEIGHT_MEDIUM};
  }

  &.active {
    color: ${p => p.theme.primary};
    background-color: ${p => p.theme.bodyBackground};

    .prefix {
      color: ${p => p.theme.primary};
    }
  }
`;
