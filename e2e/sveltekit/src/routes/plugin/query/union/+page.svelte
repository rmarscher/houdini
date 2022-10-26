<script>
  import { graphql } from '$houdini';

  const result = graphql`
    query PreprocessorTestQueryUnion {
      modelsConnection(snapshot: "preprocess-query-union") {
        edges {
          node {
            __typename
            ... on ModelA {
              data {
                x
                y
              }
            }
            ... on ModelB {
              data {
                msg
              }
            }
          }
        }
      }
    }
  `;
</script>

{#if $result.data?.modelsConnection?.edges}
  {#each $result.data?.modelsConnection.edges as edge}
    {#if edge.node.__typename === "ModelA"}
      <div id="result-union-model-a">
        x: {edge.node.data?.x}
      </div>
    {:else if edge.node.__typename === "ModelB"}
      <div id="result-union-model-b">
        msg: {edge.node.data?.msg}
      </div>
    {/if}
  {/each}
{/if}
