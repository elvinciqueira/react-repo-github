import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaStar, FaRegFileAlt, FaGithubAlt, FaSpinner } from 'react-icons/fa';
import { GoRepoForked, GoArrowLeft, GoArrowRight } from 'react-icons/go';
import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  FilterList,
  PageNav,
  OwnerProfile,
  RepoInfo,
  IssueLabel
} from './RepositoryStyles';
import Container, { Icon } from '../../components/Container';

const Repository = ({ match }) => {
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([
    { state: 'all', label: 'All Issues', active: true },
    { state: 'open', label: 'Open', active: false },
    { state: 'closed', label: 'Closed', active: false },
  ])
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function callApi() {
      const repoName = decodeURIComponent(match.params.repository);

      const [repository, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: filters.find(filter => filter.active).state,
            per_page: 4,
          }
        }),
      ]);

      setRepository(repository.data);

      setIssues(issues.data);

      setLoading(false);
    }

    callApi();
  }, []);

  const loadFilters = async () => {
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 4,
        page,
      },
    });

    setIssues(response.data);
  };

  const handleFilters = async filterIndex => {
    await setFilterIndex(filterIndex);

    loadFilters();
  };

  const handlePage = async action => {
    await setPage(action === 'back' ? page - 1 : page + 1);

    loadFilters();
  };

  if (loading) {
    return (
      <Container>
        <Icon>
          <FaGithubAlt />
        </Icon>
        <Loading loading={loading ? 1 : 0}>
          <FaSpinner />
        </Loading>
       </Container>
    )
  }

  return (
    <Container>
      <Icon>
        <FaGithubAlt />
      </Icon>
      <Owner>
        <div>
          <Link to="/">
            <GoArrowLeft /> Back to Repositories
          </Link>
        </div>
        <OwnerProfile>
          <a
            href={repository.owner.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          </a>
          <h2>{repository.owner.login}</h2>
        </OwnerProfile>
        <RepoInfo>
          <h1>
            <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
              {repository.name}
            </a>
          </h1>
          <div>
            {repository.license && (
              <span>
                <FaRegFileAlt /> {repository.license.name}
              </span>
            )}
             {repository.stargazers_count !== 0 && (
                <span>
                  <FaStar />
                  {`${Number(repository.stargazers_count).toLocaleString(undefined, {
                    minimumIntegerDigits: 2,
                  })} ${repository.stargazers_count === 1 ? 'star' : 'stars'}`}
                </span>
              )}
               {repository.forks !== 0 && (
                <span>
                  <GoRepoForked />
                  {`${Number(repository.forks_count).toLocaleString()} ${
                    repository.forks_count === 1 ? 'fork' : 'forks'
                  }`}
                </span>
              )}
          </div>
          <p>{repository.description}</p>
        </RepoInfo>
      </Owner>

      <IssueList>
          <FilterList active={filterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={filter.state}
                onClick={() => handleFilters(index)}
              >
                {filter.label}
              </button>
            ))}
          </FilterList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <span>{issue.title}</span>
                    {issue.labels.map(label => (
                      <IssueLabel key={String(label.id)} color={label.color}>
                        {label.name}
                      </IssueLabel>
                    ))}
                  </strong>
                  <p> {issue.user.login} </p>
                </div>
              </a>
            </li>
          ))}
          <PageNav>
            <button
              type="button"
              disabled={page < 2}
              onClick={() => handlePage('back')}
            >
              <GoArrowLeft />
              Prev. Page
            </button>
            <button type="button" onClick={() => handlePage('next')}>
              Next Page
              <GoArrowRight />
            </button>
          </PageNav>
        </IssueList>
    </Container>
  );
};

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default Repository;
