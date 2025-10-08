/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );

  const user = category
    ? usersFromServer.find(u => u.id === category.ownerId)
    : null;

  return {
    ...product,
    category,
    user,
  };
});

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: null,
  });

  const filteredProducts = selectedUser
    ? products.filter(
      product => product.user && product.user.id === selectedUser,
    )
    : products.filter(product => product.category && product.user);

  const categoryFilteredProducts = selectedCategories.length > 0
    ? filteredProducts.filter(product => selectedCategories.includes(product.categoryId))
    : filteredProducts;

  const searchFilteredProducts = categoryFilteredProducts.filter(
    product =>
      product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    // eslint-disable-next-line function-paren-newline
  );

  const sortedProducts = [...searchFilteredProducts].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) {
      return 0;
    }

    let aValue, bValue;

    switch (sortConfig.field) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'category':
        aValue = a.category?.title?.toLowerCase() || '';
        bValue = b.category?.title?.toLowerCase() || '';
        break;
      case 'user':
        aValue = a.user?.name?.toLowerCase() || '';
        bValue = b.user?.name?.toLowerCase() || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }

    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }

    return 0;
  });

  const handleSort = field => {
    setSortConfig(prev => {

      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }

      switch (prev.direction) {
        case 'asc':
          return { field, direction: 'desc' };
        case 'desc':
          return { field: null, direction: null };
        default:
          return { field, direction: 'asc' };
      }
    });
  };

  const getSortIcon = field => {
    if (sortConfig.field !== field) {
      return <i data-cy="SortIcon" className="fas fa-sort" />;
    }

    switch (sortConfig.direction) {
      case 'asc':
        return <i data-cy="SortIcon" className="fas fa-sort-up" />;
      case 'desc':
        return <i data-cy="SortIcon" className="fas fa-sort-down" />;
      default:
        return <i data-cy="SortIcon" className="fas fa-sort" />;
    }
  };

  const handleUserFilter = user => {
    setSelectedUser(user);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }

      return [...prev, categoryId];

    });
  };

  const handleAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleResetFilters = () => {
    setSelectedUser(null);
    setSearch('');
    setSelectedCategories([]);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={!selectedUser ? 'is-active' : ''}
                onClick={event => {
                  event.preventDefault();
                  handleUserFilter(null);
                }}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={selectedUser === user.id ? 'is-active' : ''}
                  onClick={event => {
                    event.preventDefault();
                    handleUserFilter(user.id);
                  }}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={search}
                  onChange={handleSearch}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {search && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={handleClearSearch}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${
                  selectedCategories.length === 0 ? '' : 'is-outlined'
                }`}
                onClick={event => {
                  event.preventDefault();
                  handleAllCategories();
                }}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={`button mr-2 my-1 ${
                    selectedCategories.includes(category.id) ? 'is-info' : ''
                  }`}
                  href="#/"
                  key={category.id}
                  onClick={event => {
                    event.preventDefault();
                    handleCategoryFilter(category.id);
                  }}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={event => {
                  event.preventDefault();
                  handleResetFilters();
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {searchFilteredProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a
                        href="#/"
                        onClick={event => {
                          event.preventDefault();
                          handleSort('id');
                        }}
                      >
                        <span className="icon">{getSortIcon('id')}</span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a
                        href="#/"
                        onClick={event => {
                          event.preventDefault();
                          handleSort('name');
                        }}
                      >
                        <span className="icon">{getSortIcon('name')}</span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a
                        href="#/"
                        onClick={event => {
                          event.preventDefault();
                          handleSort('category');
                        }}
                      >
                        <span className="icon">{getSortIcon('category')}</span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a
                        href="#/"
                        onClick={event => {
                          event.preventDefault();
                          handleSort('user');
                        }}
                      >
                        <span className="icon">{getSortIcon('user')}</span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
