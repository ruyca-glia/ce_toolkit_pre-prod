// audio assets don't copy over -> deleted in settings when copying

export async function onInvoke(request, env) {
    try {
        const baseBearer = request.headers.get('Authorization2');

        const envelope = await request.json();
        const payload = typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : envelope.payload;

        const { siteId, name, addy, url } = payload;

        const axios = require('axios');

        // same account
        const baseSiteId = siteId;
        const baseURL = url || "https://api.glia.com";
        const partition = "Main"; // Main or Staging
        const siteName = name;
        const address = [addy];

        const sameAccount = true;

        // diff accounts
        const newBearer = "";
        const newSiteId = "";

        const baseSite = {
            bearer: baseBearer,
            id: baseSiteId,
            partitions: [],
            policies: [],
            exceptions: [],
            teams: [],
            queues: [],
            questions: [],
            surveys: [],
            platformRules: [],
            webRules: [],
            contacts: [],
            locales: [],
            piiMasks: [],
            logoUrl: null,
            pictureUrl: null
        };

        const newSite = {
            bearer: newBearer,
            id: newSiteId,
            policies: [],
            exceptions: [],
            queues: [],
            questions: [],
            platformRules: [],
            webRules: []
        };

        // All are < old ID, new ID >
        const policyMap = new Map();
        const exceptionMap = new Map();
        const teamMap = new Map();
        const queueMap = new Map();
        const questionMap = new Map();

        const baseApi = axios.create({
            baseURL: baseURL,
            headers: {
                'Authorization': `Bearer ${baseBearer}`,
                'Accept': "application/vnd.salemove.v1+json",
                'Content-Type': "application/json"
            }
        });

        const newApi = axios.create({
            baseURL: baseURL,
            headers: {
                'Authorization': `Bearer ${sameAccount ? baseBearer : newBearer}`,
                'Accept': "application/vnd.salemove.v1+json",
                'Content-Type': "application/json"
            }
        });

        async function cloneSite() {
            try {
                const body = {
                    name: siteName,
                    addresses: address,
                    clone_from_id: baseSite.id
                };

                const response = await baseApi.post(`/sites`, body);
                newSite.id = response.data.id
            } catch (error) {
                console.log("Error creating site:");
                throw new Error(error.message);
            }
        }

        async function getPartition(environment) {
            try {
                const response = await newApi.get(`/partitions`);
                response.data.partitions ? newSite.partitions = response.data.partitions : console.log("No partitions found.");

                let partitionId = "";
                let defaultPartitionId = "";

                for (const partition of newSite.partitions) {
                    if (partition.is_default) {
                        defaultPartitionId = partition.id;
                    }
                    if (partition.name == environment) {
                        partitionId = partition.id;
                    }
                }

                // If the default pariition is not the parition we want, set the desired parition as default
                if (defaultPartitionId != partitionId) {
                    const body = {
                        is_default: true
                    }
                    const res = await newApi.patch(`/partitions/${partitionId}`, body);
                }

                return partitionId;
            } catch (error) {
                console.log("Error getting partitions:");
                throw new Error(error.message);
            }
        }

        async function getPartitions(environment) {
            try {
                const response = await newApi.get(`/partitions`);
                response.data.partitions ? newSite.partitions = response.data.partitions : console.log("No partitions found.");

                for (const partition of newSite.partitions) {
                    if (partition.name == environment) {
                        return partition.id;
                    }
                }

            } catch (error) {
                console.log("Error getting partitions:");
                throw new Error(error.message);
            }
        }

        async function cloneSchedulingPolicies() {
            try {
                const response = await baseApi.get(`/queues/scheduling_policies?site_ids[]=${baseSite.id}`);
                response.data.scheduling_policies ? baseSite.policies = response.data.scheduling_policies : console.log("No scheduling policies found.");

                for (let i = 0; i < baseSite.policies.length; i++) {
                    const policy = baseSite.policies[i];
                    const body = {
                        name: policy.name,
                        timezone: policy.timezone,
                        business_hours: policy.business_hours,
                        description: policy.description ? policy.description : ""
                    };

                    const response = await newApi.post(`/queues/scheduling_policies?site_id=${newSite.id}`, body);
                    newSite.policies.push(response.data);

                    policyMap.set(policy.id, response.data.id);
                }
            } catch (error) {
                console.log("Error cloning scheduling policies:");
                throw new Error(error.message);
            }
        }

        async function cloneSchedulingExceptions() {
            try {
                const response = await baseApi.get(`/queues/scheduling_exception_policies?view=full&site_ids[]=${baseSite.id}`);
                response.data.scheduling_exception_policies ? baseSite.exceptions = response.data.scheduling_exception_policies : console.log("No scheduling exceptions found.");

                for (let i = 0; i < baseSite.exceptions.length; i++) {
                    const exception = baseSite.exceptions[i];

                    const body = {
                        name: exception.name,
                        exception_rules: exception.exception_rules,
                        description: exception.description || ""
                    };

                    const response = await newApi.post(`/queues/scheduling_exception_policies?site_id=${newSite.id}`, body);
                    newSite.exceptions.push(response.data);

                    policyMap.set(exception.id, response.data.id);
                }
            } catch (error) {
                console.log("Error cloning scheduling exceptions:");
                throw new Error(error.message);
            }
        }

        async function getTeams() {
            try {
                const response = await baseApi.get(`/teams?site_ids[]=${baseSite.id}`);
                response.data.teams ? baseSite.teams = response.data.teams : console.log("No teams found.");

                const res = await newApi.get(`/teams?site_ids[]=${newSite.id}`);
                res.data.teams ? newSite.teams = res.data.teams : console.log("No teams found.");

                // Create the team ID map between the base site and the new site
                const tempTeamMap = new Map();
                for (const oldTeam of baseSite.teams) {
                    tempTeamMap.set(oldTeam.name, oldTeam.id);
                }

                for (const newTeam of newSite.teams) {
                    const oldId = tempTeamMap.get(newTeam.name);
                    teamMap.set(oldId, newTeam.id);
                }
            } catch (error) {
                console.log("Error syncing team mappings:");
                throw new Error(error.message);
            }
        }

        async function updateTeams(partitionId) {
            try {
                await getTeams();

                for (const team of newSite.teams) {
                    const body = {
                        partition_id: partitionId
                    };

                    if (team.name != 'General') {
                        const response = await newApi.patch(`/teams/${team.id}`, body);
                    }
                }
            } catch (error) {
                console.log("Error updating teams partition:");
                throw new Error(error.message);
            }
        }

        async function cloneQueues(partitionId) {
            try {
                // Get queues from the base site
                const response = await baseApi.get(`/queues?site_ids[]=${baseSite.id}`);
                response.data.queues ? baseSite.queues = response.data.queues : console.log("No queues found.");

                // Create temp map to efficiently create queue map below
                const tempQueueMap = new Map();
                for (const oldQueue of baseSite.queues) {
                    tempQueueMap.set(oldQueue.name, oldQueue.id);
                }

                // Clone queues to new site
                for (let i = 0; i < baseSite.queues.length; i++) {
                    const queue = baseSite.queues[i];

                    const body = {
                        site_id: newSite.id,
                        name: queue.name,
                        description: queue.description,
                        is_default: queue.is_default,
                        capacity_policy: queue.capacity_policy,
                        routing_policy: { media: queue.routing_policy.media },
                        when_unstaffed: queue.when_unstaffed,
                        operator_ranking_enabled: queue.operator_ranking_enabled,
                        welcome_message: queue.welcome_message,
                        operator_affinity: queue.operator_affinity,
                        status: queue.self_status,
                        partition_id: partitionId,
                        scheduling_policy_id: queue.scheduling_policy_id ? policyMap.get(queue.scheduling_policy_id) : null,
                        scheduling_exception_policy_id: queue.scheduling_exception_policy_id ? exceptionMap.get(queue.scheduling_exception_policy_id) : null
                    };

                    if (queue.routing_policy.team_ids) {
                        let mappedTeams = [];

                        for (const oldTeamId of queue.routing_policy.team_ids) {
                            if (teamMap.has(oldTeamId)) {
                                mappedTeams.push(teamMap.get(oldTeamId));
                            }
                        }

                        body.routing_policy = {
                            media: queue.routing_policy.media,
                            team_ids: mappedTeams
                        }
                    }

                    const response = await newApi.post(`/queues`, body);
                    newSite.queues.push(response.data);

                    queueMap.set(tempQueueMap.get(response.data.name), response.data.id);
                    console.log("Cloned " + queue.name + " queue.");
                }

                await updateQueueFallbacks();
            } catch (error) {
                console.log("Error cloning queues:");
                throw new Error(error.message);
            }
        }

        async function updateQueueFallbacks() {
            try {
                for (const queue of baseSite.queues) {
                    if (queue.fallback_queue_id) {
                        const body = {
                            fallback_queue_id: queueMap.get(queue.fallback_queue_id)
                        }

                        await newApi.put(`/queues/${clonedQueueVal.newQueueID}`, body);
                    }
                }
            } catch (error) {
                console.log("Error updating queue fallbacks:");
                throw new Error(error.message);
            }
        }

        async function cloneQuestions() {
            try {
                const response = await baseApi.get(`/sites/${baseSite.id}/survey_questions`);
                response.data ? baseSite.questions = response.data : console.log("No questions found.");

                for (const question of baseSite.questions) {
                    let body = {
                        name: question.name,
                        text: question.text,
                        type: question.type
                    };

                    if (question.type === "single_choice" && question.options) {
                        // Delete option IDs as they cannot be the same for new site
                        body.options = question.options.map(({ id, ...rest }) => rest);
                    }

                    const response = await newApi.post(`/sites/${newSite.id}/survey_questions`, body);
                    newSite.questions.push(response.data);
                    questionMap.set(question.id, response.data.id);
                }
            } catch (error) {
                console.log("Error cloning survey questions:");
                throw new Error(error.message);
            }
        }

        async function cloneSurveys() {
            try {
                const response = await baseApi.get(`/sites/${baseSite.id}/surveys`);
                response.data ? baseSite.surveys = response.data : console.log("No surveys found.");

                for (const survey of baseSite.surveys) {
                    let body = {
                        name: survey.name,
                        description: survey.description || "",
                        title: survey.title,
                        type: survey.type,
                        is_default: survey.is_default,
                        is_enabled: survey.is_enabled
                    };

                    if (survey.questions) {
                        let questions = [];
                        for (const sq of survey.questions) {

                            const newQuestionId = questionMap.get(sq.id);
                            const newQuestion = newSite.questions.find(q => q.id == newQuestionId);

                            questions.push({
                                id: newQuestionId,
                                required: sq.required,
                                position: sq.position
                            });

                        }
                        body.questions = questions;
                    }

                    if (survey.queue_ids.length) {
                        let queueIds = [];
                        for (const oldQueueId of survey.queue_ids) {
                            queueIds.push(queueMap.get(oldQueueId));
                        }
                        body.queue_ids = queueIds;
                    }

                    await newApi.post(`/sites/${newSite.id}/surveys`, body);
                }
            } catch (error) {
                console.log("Error cloning surveys:");
                throw new Error(error.message);
            }
        }

        async function clonePlatformRules() {
            try {
                const response = await baseApi.get(`/sites/${baseSite.id}/platform_rules`);
                response.data.rules ? baseSite.platformRules = response.data.rules : console.log("No platform rules found.");

                for (const rule of baseSite.platformRules) {
                    let body = {
                        site_id: newSite.id,
                        name: rule.name,
                        enabled: rule.enabled,
                        sources: rule.sources,
                        actions: rule.actions,
                        description: rule.description || ""
                    };

                    if (rule.conditions) {
                        let newConditions = [];

                        for (const condition of rule.conditions) {

                            let newCondition = { ...condition };
                            let newQueues = [];

                            if (condition.type === "from_queues") {
                                for (const oldQueueId of condition.queue_ids) {
                                    newQueues.push(queueMap.get(oldQueueId));
                                }

                                newCondition.queue_ids = newQueues;
                            }
                        }

                        body.conditions = newConditions;
                    }

                    const res = await newApi.post(`/sites/${newSite.id}/platform_rules`, body);
                    newSite.platformRules.push(res.data);
                }
            } catch (error) {
                console.log("Error cloning platform rules:");
                throw new Error(error.message);
            }
        }

        async function updateWebRules() {
            try {
                const response = await baseApi.get(`/sites/${newSite.id}/business_rules`);
                response.data.rules ? newSite.webRules = response.data.rules : console.log("No web rules found (on new site).");

                for (const rule of newSite.webRules) {
                    let body = {};
                    let update = false;

                    if (rule.actions) {
                        for (const action of rule.actions) {
                            if (action.type === "set_queues_for_visitor_v2") {
                                update = true;

                                let mediaRouting = action.media_routing;

                                if (mediaRouting.audio.enabled && mediaRouting.audio.queue_id) {
                                    mediaRouting.audio.queue_id = queueMap.get(mediaRouting.audio.queue_id);
                                }
                                if (mediaRouting.text.enabled && mediaRouting.text.queue_id) {
                                    mediaRouting.text.queue_id = queueMap.get(mediaRouting.text.queue_id);
                                }
                                if (mediaRouting.messaging.enabled && mediaRouting.messaging.queue_id) {
                                    mediaRouting.messaging.queue_id = queueMap.get(mediaRouting.messaging.queue_id);
                                }
                                if (mediaRouting.phone.enabled && mediaRouting.phone.queue_id) {
                                    mediaRouting.phone.queue_id = queueMap.get(mediaRouting.phone.queue_id);
                                }
                                if (mediaRouting.video.enabled && mediaRouting.video.queue_id) {
                                    mediaRouting.video.queue_id = queueMap.get(mediaRouting.video.queue_id);
                                }
                            }
                            body.actions = rule.actions;
                        }
                    }

                    if (rule.post_conditions) {
                        for (let j = 0; j < rule.post_conditions.length; j++) {
                            let condition = rule.post_conditions[j];
                            if (condition.type === "queues_availability") {
                                update = true;
                                body.post_conditions = rule.post_conditions;
                                for (let x = 0; x < condition.queue_ids.length; x++) {
                                    body.post_conditions[j].queue_ids[x] = queueMap.get(condition.queue_ids[x]);
                                }
                            }
                        }
                    }

                    if (update) {
                        await newApi.patch(`/sites/${newSite.id}/business_rules/${rule.id}`, body);
                    }
                }

                // Update internal object
                if (newSite.webRules.length != 0) {
                    newSite.webRules = [];
                    const res = await baseApi.get(`/sites/${newSite.id}/business_rules`);
                    res.data.rules ? newSite.webRules = response.data.rules : console.log("No web rules found to update (on new site).");
                }
            } catch (error) {
                console.log("Error processing business web rules:");
                throw new Error(error.message);
            }
        }

        async function cloneContacts() {
            try {
                let url = `/contacts?site_ids[]=${baseSite.id}`;

                while (url) {
                    const response = await baseApi.get(url);
                    response.data.contacts ? baseSite.contacts = response.data.contacts : console.log("No contacts found.");

                    for (const contact of baseSite.contacts) {
                        let body = {
                            site_id: newSite.id,
                            name: contact.name,
                            phone_number: contact.phone_number
                        };

                        if (contact.email) {
                            body.email = contact.email;
                        }
                        if (contact.description) {
                            body.description = contact.description;
                        }
                        if (contact.phone_extension) {
                            body.phone_extension = contact.phone_extension;
                        }

                        await newApi.post(`/contacts`, body);
                    }
                    // Continuous paginated discovery loop
                    url = response.data.next_page ? response.data.next_page : null;
                }
            } catch (error) {
                console.log("Error cloning quick contacts:");
                console.log(error);
                throw new Error(error.message);
            }
        }

        async function cloneCustomLocales() {
            try {
                const response = await baseApi.get(`/visitor_app/sites/${baseSite.id}/custom_locales`);
                response.data.custom_locales ? baseSite.locales = response.data.custom_locales : console.log("No custom locales found.");

                for (const locale of baseSite.locales) {
                    const body = {
                        name: locale.name,
                        description: locale.description,
                        locale_key: locale.locale_key,
                        base_locale_key: locale.base_locale_key,
                        translations: locale.translations
                    };

                    await newApi.post(`/visitor_app/sites/${newSite.id}/custom_locales`, body);
                }
            } catch (error) {
                console.log("Error cloning custom locales:");
                throw new Error(error.message);
            }
        }

        async function clonePiiMasking() {
            try {
                const response = await baseApi.get(`/masking_regular_expressions?site_id=${baseSite.id}`);
                baseSite.piiMasks = response.data.masking_regular_expressions || [];
                response.data.masking_regular_expressions ? baseSite.piiMasks = response.data.masking_regular_expressions : console.log("No custom PII masking found.");

                for (const mask of baseSite.piiMasks) {
                    let body = {
                        site_id: newSite.id,
                        regular_expression: mask.regular_expression,
                        enabled: mask.enabled,
                        name: mask.name || ""
                    };

                    await newApi.post(`/masking_regular_expressions`, body);
                }
            } catch (error) {
                console.log("Error cloning PII masking configurations:");
                throw new Error(error.message);
            }
        }

        async function cloneSiteImageAssets() {
            try {
                const response = await baseApi.get(`/sites/${baseSite.id}`);
                baseSite.logoUrl = response.data.logo ? response.data.logo.url : null;
                baseSite.pictureUrl = response.data.default_operator_picture ? response.data.default_operator_picture.url : null;

                let body = {};

                if (baseSite.logoUrl) {
                    const logoRes = await axios.get(baseSite.logoUrl, { responseType: 'arraybuffer' });
                    const logoBase64 = `data:${logoRes.headers['content-type']};base64,${Buffer.from(logoRes.data).toString('base64')}`;
                    body.logo = logoBase64;
                }

                if (baseSite.pictureUrl) {
                    const picRes = await axios.get(baseSite.pictureUrl, { responseType: 'arraybuffer' });
                    const picBase64 = `data:${picRes.headers['content-type']};base64,${Buffer.from(picRes.data).toString('base64')}`;
                    body.default_operator_picture = picBase64;
                }

                if (Object.keys(body).length > 0) {
                    await newApi.put(`/sites/${newSite.id}`, body);
                }
            } catch (error) {
                console.log("Error cloning site branding assets:");
                throw new Error(error.message);
            }
        }

        async function cloneSiteCollection() {
            try {
                console.log("Starting site cloning");

                if (sameAccount) {
                    const partitionId = await getPartition(partition);

                    await cloneSite();

                    await cloneSchedulingPolicies();
                    console.log("Cloning scheduling policies complete\n");

                    await cloneSchedulingExceptions();
                    console.log("Cloning scheduling exceptions complete\n");

                    await updateTeams(partitionId);
                    console.log("Updating teams complete\n");

                    await cloneQueues(partitionId);
                    console.log("Cloning queues complete\n");

                    await cloneQuestions();
                    console.log("Cloning questions complete\n");

                    await cloneSurveys();
                    console.log("Cloning survey complete\n");

                    await clonePlatformRules();
                    console.log("Cloning platform rules complete\n");

                    await updateWebRules();
                    console.log("Updating web rules complete\n");

                    await cloneContacts();
                    console.log("Cloning contacts complete\n");

                    await cloneCustomLocales();
                    console.log("Cloning custom locales complete\n");

                    await clonePiiMasking();
                    console.log("Cloning PII masking complete\n");

                    await cloneSiteImageAssets();
                    console.log("Updating visual elements complete\n");

                    console.log("Site cloning within same account complete.");
                } else {

                }

            } catch (error) {
                throw new Error(error.message);
            }
        }


        cloneSiteCollection();
    } catch (error) {
        console.error("Orchestrator Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
