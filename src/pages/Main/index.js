import React, { useState, useEffect } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Form, SubmitButton, List, ErrorMessage } from './MainStyles';
import Container, { Icon } from '../../components/Container';
import api from '../../services/api';

const Main = () => {
  const [repositories, setRepositories] = useState([{
    name: 'facebook/react',
    owner: {
      name: 'facebook',
      avatar_url:  'https://avatars3.githubusercontent.com/u/69631?v=4',
    },
  }]);

  const [newRepo, setNewRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //Carregar os dados do localStorage
  useEffect(() => {
    const repo = localStorage.getItem('repositories');

    if (repo) {
      setRepositories(JSON.parse(repo));
    }

  }, []);

  //Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories))
  }, [repositories]);


  const handleInputChange = event => {
    setNewRepo(event.target.value);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    setLoading(true);

    setError(false);

    try {

      if (newRepo === '') throw new Error('You need to inform one repository');

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
        owner: {
          name: response.data.owner.login,
          avatar_url: response.data.owner.avatar_url,
        },
      };

      const hasRepo = repositories.find(
        repo => repo.name.toLowerCase() === data.name.toLowerCase()
      );

      if (hasRepo) throw new Error('Duplicated Repository');

      setRepositories([...repositories, data]);

      setNewRepo('');

      setErrorMessage('');
    } catch (Error) {
      setError(true);

      setErrorMessage(
        Error.message === 'Request failed with status code 404'
          ? 'Repository not found'
          : Error.message,
      );
    } finally {
      setLoading(false);
    }

  };

  const handleDelete = repo => {
    setRepositories(repositories.filter(repository => repository.name !== repo.name
    ))
  };

  return (
    <Container>
      <Icon>
        <FaGithubAlt />
      </Icon>

      <h1>GithubRepositories</h1>

      <Form onSubmit={handleSubmit} error={error ? 1 : 0}>
        <input
          type="text"
          placeholder="Add Repository"
          value={newRepo}
          onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0} empty={!newRepo}>
          { loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </SubmitButton>
      </Form>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <List>
         {repositories.map(repo => (
          <li key={repo.name}>
            <div>
              <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                <img src={repo.owner.avatar_url} alt={repo.owner.name} />
                <span>{repo.name}</span>
              </Link>
            </div>
            <button type="button" onClick={() => handleDelete(repo)}>
              <FaTrash />
            </button>
          </li>
        ))}
      </List>
    </Container>
  );
};

export default Main;
