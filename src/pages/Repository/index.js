import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaSpinner, FaGithubAlt } from 'react-icons/fa';
import { GoArrowLeft } from 'react-icons/go';
import api from '../../services/api';

import { Loading, Owner, IssueList } from './RepositoryStyles';
import Container, { Icon } from '../../components/Container';

const Repository = ({ match }) => {
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function callApi() {
      const repoName = decodeURIComponent(match.params.repository);

      const [repository, issues] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: 'open',
            per_page: 5,
          }
        }),
      ]);

      setRepository(repository.data);

      setIssues(issues.data);

      setLoading(false);
    }

    callApi();
  }, [])

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
        <img src={repository.owner.avatar_url} alt={repository.owner.login}/>
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
      </Owner>

      <IssueList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>
    </Container>
  );
};

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired
};

export default Repository;
